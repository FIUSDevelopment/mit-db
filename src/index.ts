import { promisify } from 'util';
import * as fs from 'fs';

const writeDB = promisify(fs.writeFile);

let map: any, db: any, filename: string, dirname: string = 'data';

class MitDB {
    /**
     * @constructor
     * @param filename If not set, MapDB will only use internal memory
     * @example 'file.db'
     * @param options Options to pass in the constructor
     * @param options.dirname where to put the database?
     */
    constructor(fn?: string, options?: { dirname: string }) {
        map = new Map();

        if (fn) filename = fn;

        if (options && options.dirname) dirname = options.dirname;

        if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);

        db = `./${dirname}/${filename}`
    }

    /**
     * 
     * @param key 
     * @param value 
     */
    async set(key: string | number, value: any) {
        try {
            const file = fs.readFileSync(db);
            const data: any[] = JSON.parse(file.toString());
    
            const i = data.findIndex((pair: any) => pair.key == key);
    
            !data[i] ? data.push({ key, value }) : data[i] = { key, value };

            await writeDB(db, JSON.stringify(data));
            return data;
        } catch {
            await writeDB(db, `[${JSON.stringify({ key, value })}]`).then(() => {
                return JSON.parse(fs.readFileSync(db).toString());
            });
        }

        return 'error'
    }

    /**
     * 
     * @param key 
     */

    get(key: string | number) {
        const file = fs.readFileSync(db);
        const data: any[] = JSON.parse(file.toString());

        return data.find((pair: any) => pair.key == key)?.value || undefined;    
    }

    /**
     * 
     * @param key 
     */
    has(key: string | number) {
        const file = fs.readFileSync(db);
        const data: any[] = JSON.parse(file.toString());

        return data.find((pair: any) => pair.key == key) ? true : false;    
    }

    entries() {
        const file = fs.readFileSync(db);
        const data: any[] = JSON.parse(file.toString());

        return data.map((pair: any) => [pair.key, pair.value]);
    }

    keys() {
        const file = fs.readFileSync(db);
        const data: any[] = JSON.parse(file.toString());

        return data.map((pair: any) => pair.key);
    }

    values() {
        const file = fs.readFileSync(db);
        const data: any[] = JSON.parse(file.toString());

        return data.map((pair: any) => pair.value);
    }

    /**
     * 
     * @param callbackfn 
     */
    forEach(callback: (value: any, key: any, map: Map<any, any>) => void) {
        const file = fs.readFileSync(db);
        const data: any[] = JSON.parse(file.toString());

        data.forEach((pair: any) => callback(pair.value, pair.key, map));
    }

    /**
     * 
     * @param key 
     */
    async delete(key: string | number) {
        try {
            const file = fs.readFileSync(db);
            const data: any[] = JSON.parse(file.toString());
    
            const i = data.findIndex((pair: any) => pair.key == key);
    
            if (data[i]) {
                data.splice(i, 1);
                await writeDB(db, JSON.stringify(data));

                return true;
            } else if (!map) {
                return false;
            }
        } catch {}
        return 'error';
    }

    async clear() {
        await writeDB(db, JSON.stringify([])).catch(() => {});
    }

    size() {
        const file = fs.readFileSync(db);
        const data: any[] = JSON.parse(file.toString());

        return data.length;
    }
}

export = MitDB;
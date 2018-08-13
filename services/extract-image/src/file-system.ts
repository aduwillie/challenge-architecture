import * as Fs from 'fs';
import { resolve } from 'dns';

export const writeToFile = (filename: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            Fs.writeFile(filename, data, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve();
                }
            });
        } catch (error) {
            reject(new Error(error));
        }
    })
};

export const readFile = (filename: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            Fs.readFile(filename, (err, data: Buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        } catch (error) {
            reject(new Error(error));
        }
    });
};

const deleteOneFile = (filename): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            Fs.unlink(filename, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

export const deleteFile = async (filenames: string | string[]): Promise<any | any[]> => {
    if (Array.isArray(filenames)) {
        return await Promise.all(filenames.map(f => deleteOneFile(f)));
    } else {
        return await deleteOneFile(filenames);
    }
};

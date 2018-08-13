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

export const deleteFile = (filename: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            Fs.unlink(filename, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        } catch (error) {
            reject(error);
        }
    });
};

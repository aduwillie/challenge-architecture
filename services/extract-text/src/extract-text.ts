import * as PDFUtil from 'pdf-to-text';

export const getPdfInfo = (pathToPDF: string): Promise<Object> => {
    return new Promise((resolve, reject) => {
        try {
            PDFUtil.info(pathToPDF, (err, info) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(info)
                }
            });
        } catch (error) {
            reject(new Error(error));
        }
    });
} 

export const extractText = (pathToPDF: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            PDFUtil.pdfToText(pathToPDF, (err, data) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(data);
                }
            })
        } catch (error) {
            reject(new Error(error));
        }
    });
};

export const extractTextWithLimit = (pathToPDF: string, from: number, to: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const params =  { from, to };
            PDFUtil.pdfToText(pathToPDF, params, (err, data) => {
                if (err) {
                    reject(new Error(err));
                } else { 
                    resolve(data);
                }
            })
        } catch (error) {
            reject(new Error(error));
        }
    });
};


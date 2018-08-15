import * as Fs from 'fs';
import { PDFImage } from 'pdf-image';

export const convertPage = async (pathToPdf: string, pageNumber: number): Promise<string> => {
    try {
        const pImage = new PDFImage(pathToPdf);
        const imagePath = await pImage.convertPage(pageNumber);
        if (Fs.existsSync(imagePath)) {
            return imagePath;
        } else {
            throw new Error('Something happened during conversion!');
        }
    } catch (error) {
        throw error;
    }
};

export const extractImage = async (pathToPdf: string, pageLength: number): Promise<string> => {
    try {
        if (pageLength === 1) {
            const page = await convertPage(pathToPdf, 0)
            return page;
        }

        const pImage = new PDFImage(pathToPdf);
        let imagePaths = [];

        for (let i = 0; i < pageLength; i++) {
            const imagePath = pImage.convertPage(i);
            imagePaths.push(imagePath);
            
            if (imagePaths.length === pageLength) {
                imagePaths.sort();
            }
        }

        const combinedImage =  await combineImages(imagePaths, pImage);
        
        return combinedImage;
    } catch (error) {
        throw error
    }
};

export const combineImages = async (images: string[], pdfImage: PDFImage) => {
    try {
        const combinedImagePath: string = await pdfImage.combine(images);
        if (Fs.existsSync(combinedImagePath)) {
            return combinedImagePath;
        } else {
            throw new Error('Something happened during conversion!');
        } 
    } catch (error) {
        throw error;
    }
};

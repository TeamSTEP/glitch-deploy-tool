import fs from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';

/**
 * Empty (delete) the contents inside the given directory but not remove the directory itself.
 * This will be done recursively.
 * @param folderPath the path to the folder to empty
 * @param exclude file or folder that should be kept
 */
export const emptyFolderContent = (folderPath: string, exclude?: string[]) => {
    const folderContent = fs.readdirSync(folderPath, { withFileTypes: true });

    for (let i = 0; i < folderContent.length; i++) {
        const file = folderContent[i];
        const fullPath = path.join(folderPath, file.name);

        // skip this file if we want to exclude it
        if (exclude?.includes(file.name)) continue;

        if (file.isDirectory()) {
            // recursively remove
            rimraf.sync(fullPath);
        } else {
            fs.removeSync(fullPath);
        }
    }
};

/**
 * Copies all the content from the given folder to the destination folder recursively.
 * @param sourceDir the folder that contains the files to copy
 * @param copyTo copy target location
 * @param exclude files or folders to exclude (in file name)
 */
export const copyFolderContent = (sourceDir: string, copyTo: string, exclude?: string[]) => {
    const folderContent = fs.readdirSync(sourceDir, { withFileTypes: true });

    for (let i = 0; i < folderContent.length; i++) {
        const file = folderContent[i];
        const fullPath = path.join(sourceDir, file.name);

        // skip this file if we want to exclude it
        if (exclude?.includes(file.name)) continue;
        // copy the file to the target directory
        fs.copySync(fullPath, path.join(copyTo, file.name), { recursive: file.isDirectory() });
    }
};

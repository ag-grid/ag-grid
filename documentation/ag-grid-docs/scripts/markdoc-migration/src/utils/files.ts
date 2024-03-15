import * as fs from 'fs/promises';
import * as path from 'path';

export async function exists(filePath: string) {
    try {
        return (await fs.stat(filePath))?.isFile();
    } catch (e) {
        return false;
    }
}

export function ensureDirectory(dirPath: string) {
    return fs.mkdir(dirPath, { recursive: true });
}

export function getFileExtension(file: string) {
    return path.parse(file).ext;
}

export function getFilePathBaseName(filePath: string) {
    return path.parse(filePath).base;
}

export async function getFolderFiles(folder: string) {
    return fs.readdir(folder);
}

export async function readFile(filePath: string) {
    return (await fs.readFile(filePath)).toString();
}

export async function writeFile(filePath: string, newContent: string | Buffer) {
    await ensureDirectory(path.dirname(filePath));
    return fs.writeFile(filePath, newContent);
}

export function copyFiles(from: string, to: string, filter: (src: string, dest: string) => boolean = () => true) {
    return fs.cp(from, to, { recursive: true, filter });
}

import { globSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const LICENSE_REGEX = /(Copyright \(c\) 2015-)(\d+)( AG GRID LTD)/gm;

async function updateLicenses() {
    const fullPath = path.join(__dirname, '../../../..');
    const currentYear = new Date().getFullYear();

    const licenseFiles = globSync('**/LICENSE.txt', { cwd: fullPath, exclude: ['**/node_modules'] });

    licenseFiles.forEach((relativePath) => {
        const filePath = path.join(fullPath, relativePath);
        const contents = readFileSync(filePath, 'utf-8');

        const newContents = contents.replace(LICENSE_REGEX, `$1${currentYear}$3`);
        if (newContents !== contents) {
            writeFileSync(filePath, newContents);
        }
    });
}

updateLicenses();

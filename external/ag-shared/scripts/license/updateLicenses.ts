import { readFileSync, writeFileSync } from 'fs';
import glob from 'glob';
import path from 'path';

const LICENSE_REGEX = /(Copyright \(c\) 2015-)(\d+)( AG GRID LTD)/gm;

async function updateLicenses() {
    const fullPath = path.join(__dirname, '../../../..');
    const licenseGlob = `${fullPath}/**/LICENSE.txt`;
    const currentYear = new Date().getFullYear();

    const licenseFiles = glob.sync(licenseGlob, {
        ignore: ['**/node_modules/**'],
    });

    licenseFiles.forEach((filePath) => {
        const contents = readFileSync(filePath, 'utf-8');

        const newContents = contents.replace(LICENSE_REGEX, `$1${currentYear}$3`);
        if (newContents !== contents) {
            writeFileSync(filePath, newContents);
        }
    });
}

updateLicenses();

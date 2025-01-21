import JSONStream from 'JSONStream';
import es from 'event-stream';
import fs, { appendFileSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import prettier from 'prettier';
import request from 'request';

function updateFile(relativePath, filename) {
    const currentFile = `documentation/ag-grid-docs/public/${relativePath}/${filename}`;
    const localData = JSON.parse(readFileSync(currentFile, 'utf8'));
    const manualEntries = localData.filter((entry) => entry.manualEntry);

    let tmpFile = `/var/tmp/${filename}`;

    writeFileSync(tmpFile, '[');

    let first = true;
    manualEntries.forEach((entry) => {
        appendFileSync(tmpFile, `${first ? '' : ','}${JSON.stringify(entry)}`);
        first = false;
    });

    const stream = JSONStream.parse('*');
    stream.on('data', (data) => {
        appendFileSync(tmpFile, `${first ? '' : ','}${JSON.stringify(data)}`);
        first = false;
    });

    stream.on('end', (data) => {
        appendFileSync(tmpFile, ']');
        copyFileSync(tmpFile, currentFile);

        const prettierConfig = JSON.parse(fs.readFileSync('.prettierrc', 'utf-8'));
        prettier
            .format(fs.readFileSync(currentFile, 'utf-8'), {
                ...prettierConfig,
                filepath: currentFile,
            })
            .then((result) => fs.writeFileSync(currentFile, result))
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error);
                process.exitCode = 1;
            });
    });

    request(`https://www.ag-grid.com/${relativePath}/${filename}`).pipe(stream);
}

updateFile('pipeline', 'pipeline.json');
updateFile('changelog', 'changelog.json');

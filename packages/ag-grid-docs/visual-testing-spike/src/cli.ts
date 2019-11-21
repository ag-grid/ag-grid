import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { runSuite } from './runner';
import { specs } from './specs';
import yargs from 'yargs';

const screenshotFolder = 'compare';

const args: any = yargs
    .strict()
    .command(
        '$0 <images>',
        'Run the test suite, generate new images, and either generate a reference set or compare them against an existing set',
        y =>
            y
                .positional('images', {
                    describe: 'name of image set folder within ./compare'
                })
                .option('update', {
                    describe: 'save generated images instead of comparing'
                })
                .option('server', {
                    describe: 'ag-grid docs server to run against',
                    default: 'http://localhost:8080'
                })
                .option('report-file', {
                    describe: 'where to save the HTML report',
                    default: 'report.html'
                })
    ).argv;

/*
TODO

Specs:
Community menu
No toolbar open

*/

export const runCli = async (baseFolder: string) => {
    const folder = path.join(baseFolder, screenshotFolder, args.images);
    if (args.update) {
        const result = await inquirer.prompt([
            {
                name: 'overwrite',
                type: 'confirm',
                message: `😰  ${chalk.bold.rgb(255, 128, 0)`overwrite`} the contents of "${path.relative('.', folder)}"?`
            }
        ]);
        if (!result.overwrite) {
            process.exit();
        }
    }
    try {
        await runSuite({
            folder,
            mode: args.update ? 'update' : 'compare',
            specs,
            themes: ['alpine', 'balham', 'material', 'fresh'],
            server: args.server,
            reportFile: args.reportFile
        });
    } catch (e) {
        console.error('ERROR:', e.stack);
    }
};

import * as core from '@actions/core';
import { readFileSync } from 'fs';
import { globSync } from 'glob';
import fetch from 'node-fetch';

export interface LinterError {
    ruleId: string;
    lineNumber: number;
    column: number;
    endColumn: number;
    description: string;
}

export interface LinterReport {
    errors: LinterError[];
}

export interface LinterResponse {
    error?: string;
    report: LinterReport;
}

const linterConfig = {};

const rootDirectories = ['./packages/ag-grid-community/src', './packages/ag-grid-enterprise/src'];

const processFiles = async (files: string[]) => {
    let totalErrors = 0;

    for (const file of files) {
        console.log(`Processing file: ${file}`);

        const fileContents = readFileSync(file, 'utf8');
        if (!fileContents.trim()) {
            core.debug(`Skipping empty file ${file}`);
            continue;
        }

        const response = await fetch(`https://axe-linter.deque.com/lint-source`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'bd4558ba-7d76-4cdf-9192-a8d1503f1e4d',
            },
            body: JSON.stringify({
                source: fileContents,
                filename: file.replace('.ts', '.tsx'),
                config: linterConfig,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        if (!contentType?.includes('application/json')) {
            throw new Error('Invalid content type');
        }

        const result = (await response.json()) as LinterResponse;

        if (result.error) {
            throw new Error(result.error);
        }

        const errors = result.report.errors;
        totalErrors += errors.length;

        // Report errors using GitHub annotations
        for (const error of errors) {
            console.log('ERRORR!!!!!');
            core.error(`${file}:${error.lineNumber} - ${error.ruleId} - ${error.description}`, {
                file,
                startLine: error.lineNumber,
                startColumn: error.column,
                endColumn: error.endColumn,
                title: 'Axe Linter',
            });
        }
    }
};

(async () => {
    const tsFiles: string[] = [];
    for (const rootDirectory of rootDirectories) {
        tsFiles.push(...globSync(`${rootDirectory}/**/*.{ts,html,js}`));
    }
    await processFiles(tsFiles);
})();

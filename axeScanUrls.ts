import * as core from '@actions/core';
import AxeBuilder from '@axe-core/playwright';
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

const urls = ['', './packages/ag-grid-enterprise/src'];

const processFiles = async (urls: string[]) => {
    let totalErrors = 0;

    for (const url of urls) {
        console.log(`Processing url: ${url}`);

        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    }
};

(async () => {
    await processFiles(urls);
})();

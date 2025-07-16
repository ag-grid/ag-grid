// Create a temporary file for the worker
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { Worker } from 'worker_threads';

import { _getLevenshteinSimilarityDistance } from './fuzzyMatch';

const tmpDir = path.dirname(__filename);

async function runInWorker<T extends any[], R>(func: (...args: T) => R, ...args: T) {
    const workerPath = path.join(tmpDir, `worker-${Date.now()}.js`);
    try {
        const workerOutput = await new Promise<string>((resolve, reject) => {
            // Create a temporary worker file (simplified example)
            const workerCode = `
              const { parentPort } = require('worker_threads');
              
              parentPort.on('message', (data) => {
                try {
                  require('ts-node').register();
                  const result = ${func.toString()}(...data.args);
                  parentPort.postMessage(JSON.stringify(result));
                  process.exit(0);
                } catch (err) {
                  parentPort.postMessage({ error: err.toString() });
                  process.exit(1);
                }
              });
            `;

            fs.mkdirSync(tmpDir, { recursive: true });

            fs.writeFileSync(workerPath, workerCode);

            // Create and start the worker
            const worker = new Worker(workerPath, {});

            worker.on('message', (result_3) => {
                if (result_3.error) return reject(result_3);
                return resolve(result_3);
            });

            worker.on('error', (err) => {
                reject(err);
            });

            worker.postMessage({ func: func.toString(), args });
        });
        return JSON.parse(workerOutput) as R;
    } finally {
        // Clean up the worker file
        if (fs.existsSync(workerPath)) fs.unlinkSync(workerPath);
    }
}

describe('fuzzyMatch.ts', () => {
    describe('_getLevenshteinSimilarityDistance', () => {
        it('should return 0 for exact match', () => {
            expect(_getLevenshteinSimilarityDistance('test', 'test')).toBe(0);
        });

        it('should return 1 for simple fuzzy match', () => {
            expect(_getLevenshteinSimilarityDistance('test', 'tst')).toBe(1);
        });

        it('should return a max distance for non-matching strings', () => {
            expect(_getLevenshteinSimilarityDistance('test', 'example')).toBe('example'.length);
        });

        it('should handle case insensitivity', () => {
            expect(_getLevenshteinSimilarityDistance('Test', 'tst')).toBe(2);
        });

        it('should return lower score for matching substrings', () => {
            expect(_getLevenshteinSimilarityDistance('test string', 'tst str')).toBeLessThan(
                _getLevenshteinSimilarityDistance('test string', 'absolutely different')
            );
        });

        describe('performance', () => {
            it('should handle long strings efficiently', async () => {
                // run in a worker
                const measure = function exe(len1: number, len2: number, cwd: string) {
                    const { performance } = require('perf_hooks');
                    const path = require('path');
                    const { _getLevenshteinSimilarityDistance } = require(path.join(cwd, 'fuzzyMatch.ts'));

                    const longString1 = 'a'.repeat(len1) + 'b';
                    const longString2 = 'a'.repeat(len2) + 'c';

                    global.gc?.();

                    const first = process.memoryUsage().heapUsed;
                    _getLevenshteinSimilarityDistance(longString1, longString2);
                    return process.memoryUsage().heapUsed - first;
                };

                const [result, result2] = await Promise.all([
                    runInWorker(measure, 1e8, 1, __dirname), // 100 MB string
                    runInWorker(measure, 1e3, 1, __dirname), // 1 KB string
                ]);
                expect(result2 - result).toBeLessThan(2 * 1024 * 1024); // Less than 2MB difference
            }, 10000);
        });
    });
});

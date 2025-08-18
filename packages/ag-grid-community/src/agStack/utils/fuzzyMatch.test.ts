// Create a temporary file for the worker
// import fs from 'fs';
// import path from 'path';
// import { Worker } from 'worker_threads';
import { _fuzzySuggestions, _getLevenshteinSimilarityDistance } from './fuzzyMatch';

// async function runInWorker<T extends any[], R>(func: (...args: T) => R, ...args: T) {
//     const workerPath = path.join(__dirname, `worker-${Date.now()}.js`);
//     try {
//         const workerOutput = await new Promise<string>((resolve, reject) => {
//             // Create a temporary worker file (simplified example)
//             const workerCode = `
//               const { parentPort } = require('worker_threads');

//               parentPort.on('message', (data) => {
//                 try {
//                   require('ts-node').register();
//                   const result = ${func.toString()}(...data.args);
//                   parentPort.postMessage(JSON.stringify(result));
//                   process.exit(0);
//                 } catch (err) {
//                   parentPort.postMessage({ error: err.toString() });
//                   process.exit(1);
//                 }
//               });
//             `;

//             fs.mkdirSync(__dirname, { recursive: true });

//             fs.writeFileSync(workerPath, workerCode);

//             // Create and start the worker
//             const worker = new Worker(workerPath, {});

//             worker.on('message', (result_3) => {
//                 if (result_3.error) return reject(result_3);
//                 return resolve(result_3);
//             });

//             worker.on('error', (err) => {
//                 reject(err);
//             });

//             worker.postMessage({ func: func.toString(), args });
//         });
//         return JSON.parse(workerOutput) as R;
//     } finally {
//         // Clean up the worker file
//         if (fs.existsSync(workerPath)) fs.unlinkSync(workerPath);
//     }
// }

describe('fuzzyMatch.ts', () => {
    describe('_fuzzySuggestions', () => {
        it("shouldn't filter out exact matches", () => {
            const suggestions = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions: ['test', 'tst', 'tst str'],
                hideIrrelevant: true,
            });
            expect(suggestions.values).toEqual(['test', 'tst', 'tst str']);
        });
    });

    describe('_getLevenshteinSimilarityDistance', () => {
        it('should return 0 for exact match', () => {
            expect(_getLevenshteinSimilarityDistance('test', 'test')).toBe(0);
        });

        it('should do simple fuzzy match', () => {
            expect(_getLevenshteinSimilarityDistance('test', 'tst')).toBeLessThan(
                _getLevenshteinSimilarityDistance('test', 'tt')
            );
        });

        it('should return a max distance for non-matching strings', () => {
            expect(_getLevenshteinSimilarityDistance('banana', 'exercise')).toBe(8);
        });

        it('should handle different case', () => {
            expect(_getLevenshteinSimilarityDistance('Test', 'tst')).toBeGreaterThan(
                _getLevenshteinSimilarityDistance('test', 'tst')
            );
        });

        it('should return lower score for matching substrings', () => {
            expect(_getLevenshteinSimilarityDistance('test string', 'tst str')).toBeLessThan(
                _getLevenshteinSimilarityDistance('test string', 'absolutely different')
            );
        });

        it('favours matches at the start of the string', () => {
            const input = `${'a'.repeat(20)}abcd efgj`;
            expect(_getLevenshteinSimilarityDistance(input, 'abcd')).toBeLessThan(
                _getLevenshteinSimilarityDistance(input, 'efgj')
            );
        });

        it('favours consecutive matches', () => {
            expect(_getLevenshteinSimilarityDistance(' 12345', '12345')).toBeLessThan(
                _getLevenshteinSimilarityDistance('123_45', '12345')
            );
        });

        // describe('performance', () => {
        //     it('should handle long strings efficiently', async () => {
        //         // run in a worker
        //         const measure = function exe(len1: number, len2: number) {
        //             // eslint-disable-next-line @typescript-eslint/no-var-requires
        //             const { _getLevenshteinSimilarityDistance } = require('./fuzzyMatch');

        //             const longString1 = 'a'.repeat(len1) + 'b';
        //             const longString2 = 'a'.repeat(len2) + 'c';

        //             global.gc?.();

        //             const first = process.memoryUsage().heapUsed;
        //             _getLevenshteinSimilarityDistance(longString1, longString2);
        //             return process.memoryUsage().heapUsed - first;
        //         };

        //         const [result, result2] = await Promise.all([
        //             runInWorker(measure, 1e7, 1), // 10 MB string
        //             runInWorker(measure, 1e3, 1), // 1 KB string
        //         ]);
        //         expect(result2 - result).toBeLessThan(2 * 1024 * 1024); // Less than 2MB difference
        //     }, 10000);
        // });
    });
});

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { syncDirectory } from './sync-directory.cjs';

const [tsconfig, outputDir] = process.argv.slice(2);
if (!tsconfig || !outputDir) {
    throw new Error('usage: emit-declarations.mjs <tsconfig> <output-dir>');
}
const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emit-declarations-'));
try {
    execFileSync('npx', ['tsc', '-p', tsconfig, '--outDir', stagingDir], { stdio: 'inherit' });
    if (!fs.readdirSync(stagingDir, { recursive: true }).some((file) => file.endsWith('.d.ts'))) {
        throw new Error(`${tsconfig} emitted no declarations`);
    }
    syncDirectory(stagingDir, outputDir, { deleteStale: true, keepTopLevelFolders: false });
} catch (e) {
    console.error(`emit-declarations.mjs: ${e.message}`);
    process.exitCode = 1;
} finally {
    fs.rmSync(stagingDir, { recursive: true, force: true });
}

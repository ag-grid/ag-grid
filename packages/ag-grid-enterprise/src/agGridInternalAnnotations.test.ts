import * as fs from 'fs';
import * as path from 'path';

const ENTERPRISE_SRC = path.resolve(__dirname);
const AG_GRID_INTERNAL = 'AG_GRID_INTERNAL';

function collectSourceFiles(dir: string, out: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            collectSourceFiles(fullPath, out);
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
            out.push(fullPath);
        }
    }
    return out;
}

const annotatedFiles = collectSourceFiles(ENTERPRISE_SRC)
    .filter((filePath) => fs.readFileSync(filePath, 'utf-8').includes(AG_GRID_INTERNAL))
    .map((filePath) => path.relative(ENTERPRISE_SRC, filePath));

describe('AG_GRID_INTERNAL annotations are limited to main-internal.ts exports', () => {
    // A package with no main-internal.ts has no internal entry point, so the annotation — which
    // marks membership of that entry point — is never correct here.
    test('should have no AG_GRID_INTERNAL annotation in a package with no internal entry point', () => {
        expect(annotatedFiles).toEqual([]);
    });
});

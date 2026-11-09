import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '../../../..');

// The shape AgGridReact's props have: TData is inferred from a plain ColDef[] passed as (ColDef<TData> | ColGroupDef<TData>)[].
const FIXTURE = `
import type { ColDef, ColGroupDef } from 'ag-grid-community';
interface GridProps<TData> { columnDefs?: (ColDef<TData> | ColGroupDef<TData>)[] | null }
declare function Grid<TData = any>(props: GridProps<TData>): void;
const columnDefs: ColDef[] = [{ field: 'age' }];
Grid({ columnDefs });
`;

// Run in a child process, as only a new process can be given a smaller stack. Prints the fixture's diagnostics as JSON.
const CHECK = `
const ts = require(process.env.TS_PATH);
const program = ts.createProgram([process.env.FIXTURE], {
    noEmit: true,
    skipLibCheck: true,
    types: [],
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    baseUrl: process.env.REPO_ROOT,
    paths: {
        'ag-stack': ['packages/ag-stack/src/main.ts'],
        'ag-grid-community': ['packages/ag-grid-community/src/main.ts'],
    },
});
const diagnostics = program.getSemanticDiagnostics(program.getSourceFile(process.env.FIXTURE));
console.log(JSON.stringify(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))));
`;

// In-browser TypeScript workers (e.g. Plunker's) have far less stack than Node. The fixture needs about 150 KB while
// ColDef's variance is declared, and overflows even 600 KB without it.
const STACK_SIZE_KB = 300;

describe('ColDef type checking depth', () => {
    test('a grid typed from a ColDef[] type-checks within a browser worker sized stack', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coldef-depth-'));
        const fixture = path.join(dir, 'fixture.ts');
        fs.writeFileSync(fixture, FIXTURE);
        try {
            const result = spawnSync(process.execPath, [`--stack-size=${STACK_SIZE_KB}`, '-e', CHECK], {
                encoding: 'utf8',
                env: {
                    ...process.env,
                    TS_PATH: path.join(REPO_ROOT, 'node_modules/typescript'),
                    FIXTURE: fixture,
                    REPO_ROOT,
                },
            });
            expect(result.stderr).not.toContain('Maximum call stack size exceeded');
            expect(result.status).toBe(0);
            expect(JSON.parse(result.stdout)).toEqual([]);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});

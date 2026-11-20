import { addSharedInterfaces } from './sharedInterfaces';

describe('addSharedInterfaces', () => {
    it('imports the shared interfaces a file uses and declares them in interfaces.ts', () => {
        const files = {
            'main.ts': [
                "'use client';",
                "import { GridOptions } from 'ag-grid-community';",
                '/** ENABLE AG-TEST-ID START **/',
                "import * as agGridCommunity from 'ag-grid-community';",
                '/** ENABLE AG-TEST-ID END **/',
                'const gridOptions: GridOptions<IAccount> = {};',
            ].join('\n'),
        };

        addSharedInterfaces(files);

        expect(files['main.ts'].split('\n').slice(0, 3)).toEqual([
            "'use client';",
            "import { GridOptions } from 'ag-grid-community';",
            "import type { IAccount } from './interfaces';",
        ]);
        expect(files['interfaces.ts']).toContain('export interface ICallRecord {');
        expect(files['interfaces.ts']).toContain('export interface IAccount {');
    });

    it('leaves interfaces a file declares itself', () => {
        const main = 'interface IOlympicData { athlete: string }\nconst rows: IOlympicData[] = [];\n';
        const files = { 'main.ts': main };

        addSharedInterfaces(files);

        expect(files).toEqual({ 'main.ts': main });
    });

    it("adds what files import from interfaces.ts to the example's own interfaces.ts", () => {
        const files = {
            'main.ts': "import { FlagContext, IOlympicData } from './interfaces';\n",
            'interfaces.ts': 'export interface FlagContext {\n    flags: string[];\n}\n',
        };

        addSharedInterfaces(files);

        expect(files['main.ts']).toBe("import { FlagContext, IOlympicData } from './interfaces';\n");
        expect(files['interfaces.ts']).toMatch(
            /^export interface FlagContext \{[\s\S]*export interface IOlympicData \{/
        );
    });
});

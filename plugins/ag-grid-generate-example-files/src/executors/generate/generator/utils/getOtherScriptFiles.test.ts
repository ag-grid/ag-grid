import { renameRelativeImports } from './getOtherScriptFiles';

describe('renameRelativeImports', () => {
    it('removes the framework suffix from relative imports', () => {
        const content = "import type { NumberFilterComponent } from './numberFilterComponent_typescript';\n";

        expect(renameRelativeImports(content, '_typescript', '')).toBe(
            "import type { NumberFilterComponent } from './numberFilterComponent';\n"
        );
    });

    it('replaces the framework suffix with the generated one', () => {
        expect(renameRelativeImports("import Filter from './numberFilter_vue3';", '_vue3', 'Vue')).toBe(
            "import Filter from './numberFilterVue';"
        );
    });

    it('leaves package imports alone', () => {
        const content = "import { thing } from 'some_typescript';";

        expect(renameRelativeImports(content, '_typescript', '')).toBe(content);
    });
});

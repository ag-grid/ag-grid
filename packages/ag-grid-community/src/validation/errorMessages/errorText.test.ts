import { AG_GRID_ERRORS, NoModulesRegisteredError } from './errorText';

describe('Validate AG_GRID_ERRORS', () => {
    // eslint-disable-next-line no-restricted-properties
    test.each(Object.entries(AG_GRID_ERRORS))(
        'Calling with no params should not throw for Astro generation: ErrorKey=%i',
        (key, errorTextFn) => {
            errorTextFn({} as any);
        }
    );
});

describe('NoModulesRegisteredError', () => {
    test('shows AgGridProvider snippet when usesAgGridProvider is true', () => {
        const result = NoModulesRegisteredError(true);

        expect(result).toContain('AgGridProvider');
        expect(result).toContain('AllCommunityModule');
        expect(result).not.toContain('ModuleRegistry.registerModules');
    });

    test('shows ModuleRegistry snippet when usesAgGridProvider is false', () => {
        const result = NoModulesRegisteredError(false);

        expect(result).toContain('ModuleRegistry.registerModules');
        expect(result).toContain('AllCommunityModule');
        expect(result).not.toContain('AgGridProvider');
    });

    test('shows ModuleRegistry snippet when usesAgGridProvider is undefined', () => {
        const result = NoModulesRegisteredError();

        expect(result).toContain('ModuleRegistry.registerModules');
        expect(result).not.toContain('AgGridProvider');
    });
});

describe('error 200 (missing module)', () => {
    test('shows AgGridProvider snippet when usesAgGridProvider is true', () => {
        const result = AG_GRID_ERRORS[200]({
            reasonOrId: 'Test feature',
            moduleName: 'RowSelection',
            gridScoped: false,
            gridId: 'myGrid',
            rowModelType: 'clientSide',
            usesAgGridProvider: true,
        });

        expect(result).toContain('RowSelectionModule');
        expect(result).toContain('AgGridProvider');
        expect(result).not.toContain('ModuleRegistry.registerModules');
    });

    test('shows ModuleRegistry snippet when usesAgGridProvider is false', () => {
        const result = AG_GRID_ERRORS[200]({
            reasonOrId: 'Test feature',
            moduleName: 'RowSelection',
            gridScoped: false,
            gridId: 'myGrid',
            rowModelType: 'clientSide',
            usesAgGridProvider: false,
        });

        expect(result).toContain('RowSelectionModule');
        expect(result).toContain('ModuleRegistry.registerModules');
        expect(result).not.toContain('AgGridProvider');
    });
});

describe('error 260 (missing user component)', () => {
    test('formats missing component error with usesAgGridProvider', () => {
        const result = AG_GRID_ERRORS[260]({
            propName: 'cellEditor',
            compName: 'agRichSelectCellEditor',
            gridScoped: false,
            gridId: 'myGrid',
            rowModelType: 'clientSide',
            usesAgGridProvider: true,
        });

        expect(result).toContain('RichSelectModule');
        expect(result).toContain('AgGridProvider');
        expect(result).not.toContain('ModuleRegistry.registerModules');
    });

    test('formats missing component error without usesAgGridProvider', () => {
        const result = AG_GRID_ERRORS[260]({
            propName: 'cellEditor',
            compName: 'agRichSelectCellEditor',
            gridScoped: false,
            gridId: 'myGrid',
            rowModelType: 'clientSide',
            usesAgGridProvider: false,
        });

        expect(result).toContain('RichSelectModule');
        expect(result).toContain('ModuleRegistry.registerModules');
        expect(result).not.toContain('AgGridProvider');
    });
});

import { AG_GRID_ERRORS } from './errorText';

describe('Validate AG_GRID_ERRORS', () => {
    // eslint-disable-next-line no-restricted-properties
    test.each(Object.entries(AG_GRID_ERRORS))(
        'Calling with no params should not throw for Astro generation: ErrorKey=%i',
        (key, errorTextFn) => {
            errorTextFn({} as any);
        }
    );
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

import { getApiDocumentationModel } from '@components/reference-documentation/utils/getApiDocumentationModel';
import { getInterfaceDocumentationModel } from '@components/reference-documentation/utils/getInterfaceDocumentationModel';
import { describe, expect, it } from 'vitest';

import { buildApiReferenceSection, toRawPropertyEntry } from './buildApiReferenceTable';

const links = { framework: 'javascript' as const, siteRoot: 'https://www.ag-grid.com/' };

/**
 * buildApiReferenceTable.test.ts feeds the builder hand-written entries; these run the real
 * reference models into it, so a change to what the models hand back cannot silently empty
 * the markdown twin's descriptions and badges again.
 */
describe('buildApiReferenceSection fed by the reference models', () => {
    it('keeps the description, default and badges of an apiDocumentation property', () => {
        const model = getApiDocumentationModel({
            framework: 'javascript',
            sources: ['grid-options/properties.json'],
            section: undefined as unknown as string,
            names: [],
            config: {} as any,
            propertiesFromFiles: [
                {
                    rowModels: {
                        meta: { displayName: 'Row Models' },
                        rowHeight: { type: 'number' },
                    },
                },
            ],
            propertyConfigs: [{ codeSrc: 'grid-options.AUTO.json' }],
            codeConfigs: {
                'grid-options.AUTO.json': {
                    rowHeight: {
                        meta: {
                            comment: 'Default row height in pixels.',
                            tags: [
                                { name: 'default', comment: '25' },
                                { name: 'agModule', comment: '`RowAutoHeightModule`' },
                                { name: 'initial' },
                            ],
                        },
                    },
                },
            },
            interfaceLookup: {},
            allModules: [],
            resolveProperty: toRawPropertyEntry,
        });

        expect(model?.type).toBe('multiple');
        const [title, entry] = model!.type === 'multiple' ? model!.entries[0] : [];
        const output = buildApiReferenceSection(
            { title, meta: entry!.meta, config: {}, properties: entry!.properties },
            links
        );

        expect(output).toContain(
            '| `rowHeight` | `number` |  | `25` | Default row height in pixels. [Module](https://www.ag-grid.com/javascript-data-grid/modules/): `RowAutoHeightModule`. [Initial](https://www.ag-grid.com/javascript-data-grid/grid-interface/#initial-grid-options). |'
        );
    });

    it('narrows a multi-module badge to the module the property or page restricts it to', () => {
        const model = getApiDocumentationModel({
            framework: 'javascript',
            sources: ['grid-options/properties.json'],
            section: 'infiniteRowModel',
            names: [],
            config: { restrictModule: 'InfiniteRowModelModule' } as any,
            propertiesFromFiles: [
                {
                    infiniteRowModel: {
                        cacheBlockSize: { type: 'number' },
                        groupTotalRow: { type: 'string', restrictModule: ['RowGroupingModule'] },
                    },
                },
            ],
            propertyConfigs: [{ codeSrc: 'grid-options.AUTO.json' }],
            codeConfigs: {
                'grid-options.AUTO.json': {
                    cacheBlockSize: {
                        meta: {
                            comment: 'How many rows for each block in the store.',
                            tags: [
                                { name: 'agModule', comment: '`ServerSideRowModelModule` / `InfiniteRowModelModule`' },
                            ],
                        },
                    },
                    groupTotalRow: {
                        meta: {
                            comment: 'When provided, an extra row group total row will be inserted.',
                            tags: [{ name: 'agModule', comment: '`RowGroupingModule` / `ServerSideRowModelModule`' }],
                        },
                    },
                },
            },
            interfaceLookup: {},
            allModules: [],
            resolveProperty: toRawPropertyEntry,
        });

        expect(model?.type).toBe('single');
        const output = buildApiReferenceSection(
            { title: 'infiniteRowModel', config: { isSubset: true }, properties: model!.properties },
            links
        );

        expect(output).toContain(
            'How many rows for each block in the store. [Module](https://www.ag-grid.com/javascript-data-grid/modules/): `InfiniteRowModelModule`.'
        );
        expect(output).toContain(
            'When provided, an extra row group total row will be inserted. [Module](https://www.ag-grid.com/javascript-data-grid/modules/): `RowGroupingModule`.'
        );
        expect(output).not.toContain('ServerSideRowModelModule');
    });

    it('keeps the description of an interfaceDocumentation property', () => {
        const model = getInterfaceDocumentationModel({
            framework: 'javascript',
            interfaceName: 'ExampleParams',
            overrides: {} as any,
            config: {},
            interfaceLookup: {
                ExampleParams: {
                    meta: {},
                    type: { api: 'GridApi' },
                    docs: { api: '/** The grid api. */' },
                },
            },
            codeLookup: { ExampleParams: {} },
            resolveProperty: toRawPropertyEntry,
        });

        expect(model.type).toBe('properties');
        const properties = model.type === 'properties' ? model.properties.ExampleParams : {};
        const output = buildApiReferenceSection(
            { title: 'ExampleParams', config: { hideHeader: true }, properties },
            links
        );

        expect(output).toContain('The grid api.');
    });
});

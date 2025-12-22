import { afterEach, beforeEach, describe, test } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, GROUP_HIERARCHY_COLUMN_ID_PREFIX } from 'ag-grid-community';
import { ColumnsToolPanelModule, FiltersToolPanelModule, RowGroupingModule, SideBarModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects } from '../test-utils';

interface CustomCellDataRow {
    id: string;
    athlete: string;
    countryObject: { code: string };
    sportObject: { name: string };
    date: string;
    total: number;
}

describe('grouping providing custom cell data types', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowGroupingModule,
            SideBarModule,
            ColumnsToolPanelModule,
            FiltersToolPanelModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('group hierarchy splits date values into year and month groups', async () => {
        const DATE_REGEX = /\d{2}\/\d{2}\/\d{4}/;

        const DATA_TYPE_DEFINITIONS: GridOptions<CustomCellDataRow>['dataTypeDefinitions'] = {
            country: {
                baseDataType: 'object',
                extendsDataType: 'object',
                valueParser: (params) =>
                    params.newValue == null || params.newValue === '' ? null : { code: params.newValue },
                valueFormatter: (params) => (params.value == null ? '' : params.value.code),
                dataTypeMatcher: (value) => value && !!value.code,
            },
            sport: {
                baseDataType: 'object',
                extendsDataType: 'object',
                valueParser: (params) =>
                    params.newValue == null || params.newValue === '' ? null : { name: params.newValue },
                valueFormatter: (params) => (params.value == null ? '' : params.value.name),
                dataTypeMatcher: (value) => value && !!value.name,
            },
            dateString: {
                baseDataType: 'dateString',
                extendsDataType: 'dateString',
                valueParser: (params) =>
                    params.newValue != null && params.newValue.match(DATE_REGEX) ? params.newValue : null,
                valueFormatter: (params) => (params.value == null ? '' : params.value),
                dataTypeMatcher: (value) => typeof value === 'string' && !!value.match(DATE_REGEX),
                dateParser: (value) => {
                    if (value == null || value === '') {
                        return undefined;
                    }
                    const dateParts = value.split('/');
                    return dateParts.length === 3
                        ? new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]))
                        : undefined;
                },
                dateFormatter: (value) => {
                    if (value == null) {
                        return undefined;
                    }
                    const date = String(value.getDate());
                    const month = String(value.getMonth() + 1);
                    return `${date.length === 1 ? '0' + date : date}/${month.length === 1 ? '0' + month : month}/${value.getFullYear()}`;
                },
            },
        };

        const rowData = cachedJSONObjects.array<CustomCellDataRow>([
            {
                id: '1',
                athlete: 'Athlete A',
                countryObject: { code: 'US' },
                sportObject: { name: 'Swimming' },
                date: '24/08/2008',
                total: 4,
            },
            {
                id: '2',
                athlete: 'Athlete B',
                countryObject: { code: 'GB' },
                sportObject: { name: 'Cycling' },
                date: '25/08/2008',
                total: 2,
            },
            {
                id: '3',
                athlete: 'Athlete C',
                countryObject: { code: 'BR' },
                sportObject: { name: 'Running' },
                date: '01/09/2008',
                total: 3,
            },
        ]);

        const api = gridsManager.createGrid('customCellDataTypes', {
            columnDefs: [
                { field: 'athlete' },
                { field: 'countryObject', headerName: 'Country', cellDataType: 'country' },
                { field: 'sportObject', headerName: 'Sport', cellDataType: 'sport' },
                {
                    field: 'date',
                    cellDataType: 'dateString',
                    rowGroup: true,
                    enableRowGroup: true,
                    groupHierarchy: ['year', 'month'],
                },
                { field: 'total', aggFunc: 'sum' },
            ],
            rowData,
            getRowId: (params) => params.data.id,
            animateRows: false,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            grandTotalRow: 'bottom',
            alwaysAggregateAtRootLevel: true,
            autoGroupColumnDef: { headerName: 'Date Hierarchy' },
            dataTypeDefinitions: DATA_TYPE_DEFINITIONS,
            sideBar: true,
            defaultColDef: {},
        } satisfies GridOptions<CustomCellDataRow>);

        const colPrefix = GROUP_HIERARCHY_COLUMN_ID_PREFIX;
        const level0GroupRowId = `row-group-${colPrefix}-date-year-2008`;
        const level1GroupRowId = `${level0GroupRowId}-${colPrefix}-date-month-8`;
        const level2GroupRowId = `${level1GroupRowId}-date-24/08/2008`;

        const getRowNodeOrFail = (rowId: string) => {
            const node = api.getRowNode(rowId);
            expect(node).toBeTruthy();
            return node!;
        };

        const setAllGroupNodesExpanded = (expanded: boolean) => {
            api.forEachNode((node) => {
                if (node.group) {
                    node.setExpanded(expanded, undefined, true);
                }
            });
        };

        const expectGroupLabelAndCount = (rowId: string, expectedKey: string, expectedChildren: number) => {
            const rowNode = api.getRowNode(rowId);
            expect(rowNode?.key).toBe(expectedKey);
            expect(rowNode?.allChildrenCount).toBe(expectedChildren);
        };

        const getRowGroupColIds = () => api.getRowGroupColumns().map((column) => column.getColId());
        const initialRowGroupIds = ['ag-Grid-HierarchyColumn-date-year', 'ag-Grid-HierarchyColumn-date-month', 'date'];
        const expectRowGroupColumnCount = (count: number) => expect(getRowGroupColIds()).toHaveLength(count);

        setAllGroupNodesExpanded(false);
        expectGroupLabelAndCount(level0GroupRowId, '2008', 3);

        const level0RowNode = getRowNodeOrFail(level0GroupRowId);
        level0RowNode.setExpanded(true, undefined, true);
        expectGroupLabelAndCount(level1GroupRowId, '8', 2);

        const level1RowNode = getRowNodeOrFail(level1GroupRowId);
        level1RowNode.setExpanded(true, undefined, true);
        expectGroupLabelAndCount(level2GroupRowId, '24/08/2008', 1);

        setAllGroupNodesExpanded(true);
        await new GridRows(api, 'custom cell data hierarchy').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
            ├─┬ filler id:row-group-ag-Grid-HierarchyColumn-date-year-2008 ag-Grid-AutoColumn:"2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ ├─┬ filler id:row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-8 ag-Grid-AutoColumn:"8" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ │ ├─┬ LEAF_GROUP id:"row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-8-date-24/08/2008" ag-Grid-AutoColumn:"24/08/2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ │ │ ├── LEAF id:1 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"8" athlete:"Athlete A" countryObject:"US" sportObject:"Swimming" date:"24/08/2008" total:4
            │ │ │ └─ footer id:"rowGroupFooter_row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-8-date-24/08/2008" ag-Grid-AutoColumn:"Total 24/08/2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:4
            │ │ ├─┬ LEAF_GROUP id:"row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-8-date-25/08/2008" ag-Grid-AutoColumn:"25/08/2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ │ │ ├── LEAF id:2 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"8" athlete:"Athlete B" countryObject:"GB" sportObject:"Cycling" date:"25/08/2008" total:2
            │ │ │ └─ footer id:"rowGroupFooter_row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-8-date-25/08/2008" ag-Grid-AutoColumn:"Total 25/08/2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:2
            │ │ └─ footer id:rowGroupFooter_row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-8 ag-Grid-AutoColumn:"Total 8" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:6
            │ ├─┬ filler id:row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-9 ag-Grid-AutoColumn:"9" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ │ ├─┬ LEAF_GROUP id:"row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-9-date-01/09/2008" ag-Grid-AutoColumn:"01/09/2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ │ │ ├── LEAF id:3 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"9" athlete:"Athlete C" countryObject:"BR" sportObject:"Running" date:"01/09/2008" total:3
            │ │ │ └─ footer id:"rowGroupFooter_row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-9-date-01/09/2008" ag-Grid-AutoColumn:"Total 01/09/2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:3
            │ │ └─ footer id:rowGroupFooter_row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-9 ag-Grid-AutoColumn:"Total 9" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:3
            │ └─ footer id:rowGroupFooter_row-group-ag-Grid-HierarchyColumn-date-year-2008 ag-Grid-AutoColumn:"Total 2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
        `);

        expect(getRowGroupColIds()).toEqual(initialRowGroupIds);
        expectRowGroupColumnCount(3);

        api.setColumnsVisible(['ag-Grid-HierarchyColumn-date-year', 'ag-Grid-HierarchyColumn-date-month'], true);
        expect(getRowGroupColIds()).toEqual(initialRowGroupIds);
        expectRowGroupColumnCount(3);

        api.removeRowGroupColumns(['date']);
        expect(getRowGroupColIds()).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
        ]);
        expectRowGroupColumnCount(2);
        setAllGroupNodesExpanded(true);
        await new GridRows(api, 'after removing original date group').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
            ├─┬ filler id:row-group-ag-Grid-HierarchyColumn-date-year-2008 ag-Grid-AutoColumn:"2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ ├─┬ LEAF_GROUP id:row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-8 ag-Grid-AutoColumn:"8" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ │ ├── LEAF id:1 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"8" athlete:"Athlete A" countryObject:"US" sportObject:"Swimming" date:"24/08/2008" total:4
            │ │ ├── LEAF id:2 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"8" athlete:"Athlete B" countryObject:"GB" sportObject:"Cycling" date:"25/08/2008" total:2
            │ │ └─ footer id:rowGroupFooter_row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-8 ag-Grid-AutoColumn:"Total 8" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:6
            │ ├─┬ LEAF_GROUP id:row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-9 ag-Grid-AutoColumn:"9" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ │ ├── LEAF id:3 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"9" athlete:"Athlete C" countryObject:"BR" sportObject:"Running" date:"01/09/2008" total:3
            │ │ └─ footer id:rowGroupFooter_row-group-ag-Grid-HierarchyColumn-date-year-2008-ag-Grid-HierarchyColumn-date-month-9 ag-Grid-AutoColumn:"Total 9" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:3
            │ └─ footer id:rowGroupFooter_row-group-ag-Grid-HierarchyColumn-date-year-2008 ag-Grid-AutoColumn:"Total 2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
        `);

        api.removeRowGroupColumns(['ag-Grid-HierarchyColumn-date-month']);
        expect(getRowGroupColIds()).toEqual(['ag-Grid-HierarchyColumn-date-year']);
        expectRowGroupColumnCount(1);
        setAllGroupNodesExpanded(true);
        await new GridRows(api, 'after removing month hierarchy group').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
            ├─┬ LEAF_GROUP id:row-group-ag-Grid-HierarchyColumn-date-year-2008 ag-Grid-AutoColumn:"2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ ├── LEAF id:1 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"8" athlete:"Athlete A" countryObject:"US" sportObject:"Swimming" date:"24/08/2008" total:4
            │ ├── LEAF id:2 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"8" athlete:"Athlete B" countryObject:"GB" sportObject:"Cycling" date:"25/08/2008" total:2
            │ ├── LEAF id:3 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"9" athlete:"Athlete C" countryObject:"BR" sportObject:"Running" date:"01/09/2008" total:3
            │ └─ footer id:rowGroupFooter_row-group-ag-Grid-HierarchyColumn-date-year-2008 ag-Grid-AutoColumn:"Total 2008" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
        `);

        api.removeRowGroupColumns(['ag-Grid-HierarchyColumn-date-year']);
        expect(getRowGroupColIds()).toEqual([]);
        expectRowGroupColumnCount(0);
        setAllGroupNodesExpanded(true);
        await new GridRows(api, 'after removing all hierarchy groups').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
            ├── LEAF id:1 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"8" athlete:"Athlete A" countryObject:"US" sportObject:"Swimming" date:"24/08/2008" total:4
            ├── LEAF id:2 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"8" athlete:"Athlete B" countryObject:"GB" sportObject:"Cycling" date:"25/08/2008" total:2
            ├── LEAF id:3 ag-Grid-HierarchyColumn-date-year:"2008" ag-Grid-HierarchyColumn-date-month:"9" athlete:"Athlete C" countryObject:"BR" sportObject:"Running" date:"01/09/2008" total:3
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null total:9
        `);
    });
});

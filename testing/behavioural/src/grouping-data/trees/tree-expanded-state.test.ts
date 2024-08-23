import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { TestGridsManager, flushJestTimers } from '../../test-utils';
import type { TreeDiagramOptions } from './tree-test-utils';
import { TreeDiagram } from './tree-test-utils';

const getDataPath = (data: any) => data.orgHierarchy;

describe('ag-grid tree expanded state', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, RowGroupingModule] });

    const treeDiagramOptions: TreeDiagramOptions = {
        checkDom: 'myGrid',
    };

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        gridsManager.reset();
    });

    // Test for AG-12591
    test('When removing a group and so it gets replaced by a filler node, its expanded state is retained', async () => {
        const originalRowData = getOrgHierarchyData();
        let yooCounter = 0;

        jest.useFakeTimers({ advanceTimers: true });

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'jobTitle' }, { field: 'employmentType' }],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            defaultColDef: { flex: 1 },
            treeData: true,
            animateRows: false,
            rowData: originalRowData,
            getRowId: ({ data }) => data.id,
            getDataPath,
            onRowGroupOpened: ({ data }) => {
                if (!data) return;
                setTimeout(() => {
                    const oldEntries = api.getGridOption('rowData')!;
                    const yoo = `yoo-${++yooCounter}`;
                    const newEntries = [
                        ...(data.orgHierarchy.length < 3 ? oldEntries : oldEntries.filter((b) => b.id !== data.id)),
                        {
                            ...data,
                            id: yoo,
                            orgHierarchy: [...(data?.orgHierarchy ?? []), yoo],
                        },
                    ];

                    api.setGridOption('rowData', newEntries);
                }, 1);
            },
        });

        await flushJestTimers();

        new TreeDiagram(api, '', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └─┬ Erica Rogers GROUP !expanded id:0
            · └─┬ Malcolm Barrett GROUP !expanded id:1
            · · ├─┬ Esther Baker GROUP !expanded id:2
            · · │ ├─┬ Brittany Hanson GROUP !expanded id:3
            · · │ │ ├── Leah Flowers LEAF id:4
            · · │ │ └── Tammy Sutton LEAF id:5
            · · │ └── Derek Paul LEAF id:6
            · · └─┬ Francis Strickland GROUP !expanded id:7
            · · · ├── Morris Hanson LEAF id:8
            · · · ├── Todd Tyler LEAF id:9
            · · · ├── Bennie Wise LEAF id:10
            · · · └── Joel Cooper LEAF id:11
        `);

        jest.useFakeTimers({ advanceTimers: true });

        api.getRowNode('0')!.setExpanded(true);
        api.getRowNode('1')!.setExpanded(true);

        await flushJestTimers();

        new TreeDiagram(api, '', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └─┬ Erica Rogers GROUP id:0
            · ├─┬ Malcolm Barrett GROUP id:1
            · │ ├─┬ Esther Baker GROUP !expanded id:2
            · │ │ ├─┬ Brittany Hanson GROUP !expanded id:3
            · │ │ │ ├── Leah Flowers LEAF id:4
            · │ │ │ └── Tammy Sutton LEAF id:5
            · │ │ └── Derek Paul LEAF id:6
            · │ ├─┬ Francis Strickland GROUP !expanded id:7
            · │ │ ├── Morris Hanson LEAF id:8
            · │ │ ├── Todd Tyler LEAF id:9
            · │ │ ├── Bennie Wise LEAF id:10
            · │ │ └── Joel Cooper LEAF id:11
            · │ └── yoo-2 LEAF id:yoo-2
            · └── yoo-1 LEAF id:yoo-1
        `);

        jest.useFakeTimers({ advanceTimers: true });

        api.getRowNode('7')!.setExpanded(true);
        api.getRowNode('2')!.setExpanded(true);

        await flushJestTimers();

        new TreeDiagram(api, '', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └─┬ Erica Rogers GROUP id:0
            · ├─┬ Malcolm Barrett GROUP id:1
            · │ ├─┬ Esther Baker filler id:row-group-0-Erica Rogers-1-Malcolm Barrett-2-Esther Baker
            · │ │ ├─┬ Brittany Hanson GROUP !expanded id:3
            · │ │ │ ├── Leah Flowers LEAF id:4
            · │ │ │ └── Tammy Sutton LEAF id:5
            · │ │ ├── Derek Paul LEAF id:6
            · │ │ └── yoo-4 LEAF id:yoo-4
            · │ ├─┬ Francis Strickland filler id:row-group-0-Erica Rogers-1-Malcolm Barrett-2-Francis Strickland
            · │ │ ├── Morris Hanson LEAF id:8
            · │ │ ├── Todd Tyler LEAF id:9
            · │ │ ├── Bennie Wise LEAF id:10
            · │ │ ├── Joel Cooper LEAF id:11
            · │ │ └── yoo-3 LEAF id:yoo-3
            · │ └── yoo-2 LEAF id:yoo-2
            · └── yoo-1 LEAF id:yoo-1
        `);
    });
});

function getOrgHierarchyData() {
    return [
        {
            id: '0',
            orgHierarchy: ['Erica Rogers'],
            jobTitle: 'CEO',
            employmentType: 'Permanent',
        },
        {
            id: '1',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett'],
            jobTitle: 'Exec. Vice President',
            employmentType: 'Permanent',
        },

        {
            id: '2',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker'],
            jobTitle: 'Director of Operations',
            employmentType: 'Permanent',
        },
        {
            id: '3',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker', 'Brittany Hanson'],
            jobTitle: 'Fleet Coordinator',
            employmentType: 'Permanent',
        },
        {
            id: '4',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker', 'Brittany Hanson', 'Leah Flowers'],
            jobTitle: 'Parts Technician',
            employmentType: 'Contract',
        },
        {
            id: '5',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker', 'Brittany Hanson', 'Tammy Sutton'],
            jobTitle: 'Service Technician',
            employmentType: 'Contract',
        },
        {
            id: '6',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker', 'Derek Paul'],
            jobTitle: 'Inventory Control',
            employmentType: 'Permanent',
        },

        {
            id: '7',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland'],
            jobTitle: 'VP Sales',
            employmentType: 'Permanent',
        },
        {
            id: '8',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland', 'Morris Hanson'],
            jobTitle: 'Sales Manager',
            employmentType: 'Permanent',
        },
        {
            id: '9',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland', 'Todd Tyler'],
            jobTitle: 'Sales Executive',
            employmentType: 'Contract',
        },
        {
            id: '10',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland', 'Bennie Wise'],
            jobTitle: 'Sales Executive',
            employmentType: 'Contract',
        },
        {
            id: '11',
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland', 'Joel Cooper'],
            jobTitle: 'Sales Executive',
            employmentType: 'Permanent',
        },
    ];
}

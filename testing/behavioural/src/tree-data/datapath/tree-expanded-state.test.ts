import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';

const getDataPath = (data: any) => data.orgHierarchy;

describe('ag-grid tree expanded state', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    const gridRowsOptions: GridRowsOptions = {};

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
        gridsManager.reset();
    });

    // Test for AG-12591
    test('When removing a group and so it gets replaced by a filler node, its expanded state is retained', async () => {
        const originalRowData = getOrgHierarchyData();
        let yooCounter = 0;

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
                if (!data) {
                    return;
                }
                const oldEntries = api.getGridOption('rowData') ?? [];
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
            },
        });

        await asyncSetTimeout(1);

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ "Erica Rogers" GROUP collapsed id:0 ag-Grid-AutoColumn:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · └─┬ "Malcolm Barrett" GROUP collapsed hidden id:1 ag-Grid-AutoColumn:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · · ├─┬ "Esther Baker" GROUP collapsed hidden id:2 ag-Grid-AutoColumn:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · · │ ├─┬ "Brittany Hanson" GROUP collapsed hidden id:3 ag-Grid-AutoColumn:"Brittany Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · · │ │ ├── "Leah Flowers" LEAF hidden id:4 ag-Grid-AutoColumn:"Leah Flowers" jobTitle:"Parts Technician" employmentType:"Contract"
            · · │ │ └── "Tammy Sutton" LEAF hidden id:5 ag-Grid-AutoColumn:"Tammy Sutton" jobTitle:"Service Technician" employmentType:"Contract"
            · · │ └── "Derek Paul" LEAF hidden id:6 ag-Grid-AutoColumn:"Derek Paul" jobTitle:"Inventory Control" employmentType:"Permanent"
            · · └─┬ "Francis Strickland" GROUP collapsed hidden id:7 ag-Grid-AutoColumn:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · · · ├── "Morris Hanson" LEAF hidden id:8 ag-Grid-AutoColumn:"Morris Hanson" jobTitle:"Sales Manager" employmentType:"Permanent"
            · · · ├── "Todd Tyler" LEAF hidden id:9 ag-Grid-AutoColumn:"Todd Tyler" jobTitle:"Sales Executive" employmentType:"Contract"
            · · · ├── "Bennie Wise" LEAF hidden id:10 ag-Grid-AutoColumn:"Bennie Wise" jobTitle:"Sales Executive" employmentType:"Contract"
            · · · └── "Joel Cooper" LEAF hidden id:11 ag-Grid-AutoColumn:"Joel Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
        `);

        api.getRowNode('0')!.setExpanded(true, undefined, true);
        api.getRowNode('1')!.setExpanded(true, undefined, true);

        await asyncSetTimeout(1);

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ "Erica Rogers" GROUP id:0 ag-Grid-AutoColumn:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ "Malcolm Barrett" GROUP id:1 ag-Grid-AutoColumn:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├─┬ "Esther Baker" GROUP collapsed id:2 ag-Grid-AutoColumn:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ │ ├─┬ "Brittany Hanson" GROUP collapsed hidden id:3 ag-Grid-AutoColumn:"Brittany Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · │ │ │ ├── "Leah Flowers" LEAF hidden id:4 ag-Grid-AutoColumn:"Leah Flowers" jobTitle:"Parts Technician" employmentType:"Contract"
            · │ │ │ └── "Tammy Sutton" LEAF hidden id:5 ag-Grid-AutoColumn:"Tammy Sutton" jobTitle:"Service Technician" employmentType:"Contract"
            · │ │ └── "Derek Paul" LEAF hidden id:6 ag-Grid-AutoColumn:"Derek Paul" jobTitle:"Inventory Control" employmentType:"Permanent"
            · │ ├─┬ "Francis Strickland" GROUP collapsed id:7 ag-Grid-AutoColumn:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · │ │ ├── "Morris Hanson" LEAF hidden id:8 ag-Grid-AutoColumn:"Morris Hanson" jobTitle:"Sales Manager" employmentType:"Permanent"
            · │ │ ├── "Todd Tyler" LEAF hidden id:9 ag-Grid-AutoColumn:"Todd Tyler" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ │ ├── "Bennie Wise" LEAF hidden id:10 ag-Grid-AutoColumn:"Bennie Wise" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ │ └── "Joel Cooper" LEAF hidden id:11 ag-Grid-AutoColumn:"Joel Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
            · │ └── yoo-2 LEAF id:yoo-2 ag-Grid-AutoColumn:"yoo-2" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · └── yoo-1 LEAF id:yoo-1 ag-Grid-AutoColumn:"yoo-1" jobTitle:"CEO" employmentType:"Permanent"
        `);

        api.getRowNode('7')!.setExpanded(true, undefined, true);
        api.getRowNode('2')!.setExpanded(true, undefined, true);

        await asyncSetTimeout(1);

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ "Erica Rogers" GROUP id:0 ag-Grid-AutoColumn:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ "Malcolm Barrett" GROUP id:1 ag-Grid-AutoColumn:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├─┬ "Esther Baker" filler id:"row-group-0-Erica Rogers-1-Malcolm Barrett-2-Esther Baker" ag-Grid-AutoColumn:"Esther Baker"
            · │ │ ├─┬ "Brittany Hanson" GROUP collapsed id:3 ag-Grid-AutoColumn:"Brittany Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · │ │ │ ├── "Leah Flowers" LEAF hidden id:4 ag-Grid-AutoColumn:"Leah Flowers" jobTitle:"Parts Technician" employmentType:"Contract"
            · │ │ │ └── "Tammy Sutton" LEAF hidden id:5 ag-Grid-AutoColumn:"Tammy Sutton" jobTitle:"Service Technician" employmentType:"Contract"
            · │ │ ├── "Derek Paul" LEAF id:6 ag-Grid-AutoColumn:"Derek Paul" jobTitle:"Inventory Control" employmentType:"Permanent"
            · │ │ └── yoo-4 LEAF id:yoo-4 ag-Grid-AutoColumn:"yoo-4" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ ├─┬ "Francis Strickland" filler id:"row-group-0-Erica Rogers-1-Malcolm Barrett-2-Francis Strickland" ag-Grid-AutoColumn:"Francis Strickland"
            · │ │ ├── "Morris Hanson" LEAF id:8 ag-Grid-AutoColumn:"Morris Hanson" jobTitle:"Sales Manager" employmentType:"Permanent"
            · │ │ ├── "Todd Tyler" LEAF id:9 ag-Grid-AutoColumn:"Todd Tyler" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ │ ├── "Bennie Wise" LEAF id:10 ag-Grid-AutoColumn:"Bennie Wise" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ │ ├── "Joel Cooper" LEAF id:11 ag-Grid-AutoColumn:"Joel Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
            · │ │ └── yoo-3 LEAF id:yoo-3 ag-Grid-AutoColumn:"yoo-3" jobTitle:"VP Sales" employmentType:"Permanent"
            · │ └── yoo-2 LEAF id:yoo-2 ag-Grid-AutoColumn:"yoo-2" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · └── yoo-1 LEAF id:yoo-1 ag-Grid-AutoColumn:"yoo-1" jobTitle:"CEO" employmentType:"Permanent"
        `);
    });

    test('updated node that creates filler starts collapsed', async () => {
        const node1 = {
            path: ['Desktop', 'ProjectAlpha', 'Proposal.docx'],
            key: '1',
        };

        const node2 = {
            path: ['Desktop', 'ProjectAlpha', 'Timeline.xlsx'],
            key: '2',
        };

        const rowData = [node1, node2];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            rowData,
            treeData: true,
            groupDefaultExpanded: 0,
            getDataPath: (data) => data.path,
            getRowId: (params) => params.data.key,
        });

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Desktop filler collapsed id:row-group-0-Desktop ag-Grid-AutoColumn:"Desktop"
            · └─┬ ProjectAlpha filler collapsed hidden id:row-group-0-Desktop-1-ProjectAlpha ag-Grid-AutoColumn:"ProjectAlpha"
            · · ├── Proposal.docx LEAF hidden id:1 ag-Grid-AutoColumn:"Proposal.docx"
            · · └── Timeline.xlsx LEAF hidden id:2 ag-Grid-AutoColumn:"Timeline.xlsx"
        `);

        // Expand Desktop and ProjectAlpha
        api.getRowNode('row-group-0-Desktop')!.setExpanded(true, undefined, true);
        api.getRowNode('row-group-0-Desktop-1-ProjectAlpha')!.setExpanded(true, undefined, true);

        gridRows = new GridRows(api, 'expanded', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Desktop filler id:row-group-0-Desktop ag-Grid-AutoColumn:"Desktop"
            · └─┬ ProjectAlpha filler id:row-group-0-Desktop-1-ProjectAlpha ag-Grid-AutoColumn:"ProjectAlpha"
            · · ├── Proposal.docx LEAF id:1 ag-Grid-AutoColumn:"Proposal.docx"
            · · └── Timeline.xlsx LEAF id:2 ag-Grid-AutoColumn:"Timeline.xlsx"
        `);

        const update = () => {
            const last_node = node2.path[node2.path.length - 1];

            // Create the update node
            const updateNode = { ...node2 };
            updateNode.path = [
                ...updateNode.path.slice(0, updateNode.path.length - 1),
                last_node + '-virtual',
                last_node,
            ];
            const newNode = { ...node2, key: '3' };

            newNode.path = [...newNode.path.slice(0, newNode.path.length - 1), last_node + '-virtual', 'newNode'];

            api.applyTransaction({ update: [updateNode], add: [newNode] });
        };

        update();

        gridRows = new GridRows(api, 'updated', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Desktop filler id:row-group-0-Desktop ag-Grid-AutoColumn:"Desktop"
            · └─┬ ProjectAlpha filler id:row-group-0-Desktop-1-ProjectAlpha ag-Grid-AutoColumn:"ProjectAlpha"
            · · ├── Proposal.docx LEAF id:1 ag-Grid-AutoColumn:"Proposal.docx"
            · · └─┬ Timeline.xlsx-virtual filler collapsed id:row-group-0-Desktop-1-ProjectAlpha-2-Timeline.xlsx-virtual ag-Grid-AutoColumn:"Timeline.xlsx-virtual"
            · · · ├── Timeline.xlsx LEAF hidden id:2 ag-Grid-AutoColumn:"Timeline.xlsx"
            · · · └── newNode LEAF hidden id:3 ag-Grid-AutoColumn:"newNode"
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

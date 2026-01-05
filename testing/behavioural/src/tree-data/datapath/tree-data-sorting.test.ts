import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../../test-utils';

describe('tree dats sorting behaviour', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('sorting desc keep groups in the right position', async () => {
        const rowData = [
            { id: '1', path: ['Desktop', 'ProjectAlpha', 'Proposal.docx'], size: 512000 },
            { id: '2', path: ['Desktop', 'ProjectAlpha', 'Timeline.xlsx'], size: 1048576 },
            { id: '3', path: ['Desktop', 'ToDoList.txt'], size: 51200 },
            { id: '4', path: ['Desktop', 'MeetingNotes_August.pdf'], size: 460800 },
            { id: '5', path: ['Documents', 'Work', 'ProjectAlpha'] },
            { id: '6', path: ['Documents', 'Work', 'ProjectAlpha', 'Proposal.docx'], size: 512000 },
            { id: '7', path: ['Documents', 'Work', 'ProjectAlpha', 'Timeline.xlsx'], size: 1048576 },
            { id: '8', path: ['Documents', 'Work', 'ProjectBeta', 'Report.pdf'], size: 1024000 },
            { id: '9', path: ['Documents', 'Work', 'ProjectBeta', 'Budget.xlsx'], size: 1048576 },
            { id: '10', path: ['Documents', 'Work', 'Meetings', 'TeamMeeting_August.pdf'], size: 512000 },
            { id: '11', path: ['Documents', 'Work', 'Meetings', 'ClientMeeting_July.pdf'], size: 1048576 },
            { id: '12', path: ['Documents', 'Personal', 'Taxes', '2022.pdf'], size: 1024000 },
            { id: '13', path: ['Documents', 'Personal', 'Taxes', '2021.pdf'], size: 1048576 },
            { id: '14', path: ['Documents', 'Personal', 'Taxes', '2020.pdf'], size: 1024000 },
            { id: '15', path: ['Pictures', 'Vacation2019', 'Beach.jpg'], size: 1048576 },
            { id: '16', path: ['Pictures', 'Vacation2019', 'Mountain.png'], size: 2048000 },
            { id: '17', path: ['Pictures', 'Family', 'Birthday2022.jpg'], size: 3072000 },
            { id: '18', path: ['Pictures', 'Family', 'Christmas2021.png'], size: 2048000 },
            { id: '19', path: ['Videos', 'Vacation2019', 'Beach.mov'], size: 4194304 },
            { id: '20', path: ['Videos', 'Vacation2019', 'Hiking.mp4'], size: 4194304 },
            { id: '21', path: ['Videos', 'Family', 'Birthday2022.mp4'], size: 6291456 },
            { id: '22', path: ['Videos', 'Family', 'Christmas2021.mov'], size: 6291456 },
            { id: '23', path: ['Downloads', 'SoftwareInstaller.exe'], size: 2097152 },
            { id: '24', path: ['Downloads', 'Receipt_OnlineStore.pdf'], size: 1048576 },
            { id: '25', path: ['Downloads', 'Ebook.pdf'], size: 1048576 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    field: 'size',
                    aggFunc: 'sum',
                    valueFormatter: (params) => {
                        const sizeInKb = params.value / 1024;
                        if (sizeInKb > 1024) {
                            return `${+(sizeInKb / 1024).toFixed(2)} MB`;
                        }
                        return `${+sizeInKb.toFixed(2)} KB`;
                    },
                },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 100,
            },
            autoGroupColumnDef: {
                headerName: 'File Explorer',
                minWidth: 280,
                filter: 'agTextColumnFilter',

                cellRendererParams: {
                    suppressCount: true,
                },
            },
            groupDefaultExpanded: -1,
            treeData: true,
            getDataPath: (data) => data.path,
            getRowId: (params) => params.data.id,
            rowData,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID size:"NaN KB"
            ├─┬ Desktop filler id:row-group-0-Desktop ag-Grid-AutoColumn:"Desktop" size:"1.98 MB"
            │ ├─┬ ProjectAlpha filler id:row-group-0-Desktop-1-ProjectAlpha ag-Grid-AutoColumn:"ProjectAlpha" size:"1.49 MB"
            │ │ ├── Proposal.docx LEAF id:1 ag-Grid-AutoColumn:"Proposal.docx" size:"500 KB"
            │ │ └── Timeline.xlsx LEAF id:2 ag-Grid-AutoColumn:"Timeline.xlsx" size:"1024 KB"
            │ ├── ToDoList.txt LEAF id:3 ag-Grid-AutoColumn:"ToDoList.txt" size:"50 KB"
            │ └── MeetingNotes_August.pdf LEAF id:4 ag-Grid-AutoColumn:"MeetingNotes_August.pdf" size:"450 KB"
            ├─┬ Documents filler id:row-group-0-Documents ag-Grid-AutoColumn:"Documents" size:"7.91 MB"
            │ ├─┬ Work filler id:row-group-0-Documents-1-Work ag-Grid-AutoColumn:"Work" size:"4.95 MB"
            │ │ ├─┬ ProjectAlpha GROUP id:5 ag-Grid-AutoColumn:"ProjectAlpha" size:"1.49 MB"
            │ │ │ ├── Proposal.docx LEAF id:6 ag-Grid-AutoColumn:"Proposal.docx" size:"500 KB"
            │ │ │ └── Timeline.xlsx LEAF id:7 ag-Grid-AutoColumn:"Timeline.xlsx" size:"1024 KB"
            │ │ ├─┬ ProjectBeta filler id:row-group-0-Documents-1-Work-2-ProjectBeta ag-Grid-AutoColumn:"ProjectBeta" size:"1.98 MB"
            │ │ │ ├── Report.pdf LEAF id:8 ag-Grid-AutoColumn:"Report.pdf" size:"1000 KB"
            │ │ │ └── Budget.xlsx LEAF id:9 ag-Grid-AutoColumn:"Budget.xlsx" size:"1024 KB"
            │ │ └─┬ Meetings filler id:row-group-0-Documents-1-Work-2-Meetings ag-Grid-AutoColumn:"Meetings" size:"1.49 MB"
            │ │ · ├── TeamMeeting_August.pdf LEAF id:10 ag-Grid-AutoColumn:"TeamMeeting_August.pdf" size:"500 KB"
            │ │ · └── ClientMeeting_July.pdf LEAF id:11 ag-Grid-AutoColumn:"ClientMeeting_July.pdf" size:"1024 KB"
            │ └─┬ Personal filler id:row-group-0-Documents-1-Personal ag-Grid-AutoColumn:"Personal" size:"2.95 MB"
            │ · └─┬ Taxes filler id:row-group-0-Documents-1-Personal-2-Taxes ag-Grid-AutoColumn:"Taxes" size:"2.95 MB"
            │ · · ├── "2022.pdf" LEAF id:12 ag-Grid-AutoColumn:"2022.pdf" size:"1000 KB"
            │ · · ├── "2021.pdf" LEAF id:13 ag-Grid-AutoColumn:"2021.pdf" size:"1024 KB"
            │ · · └── "2020.pdf" LEAF id:14 ag-Grid-AutoColumn:"2020.pdf" size:"1000 KB"
            ├─┬ Pictures filler id:row-group-0-Pictures ag-Grid-AutoColumn:"Pictures" size:"7.84 MB"
            │ ├─┬ Vacation2019 filler id:row-group-0-Pictures-1-Vacation2019 ag-Grid-AutoColumn:"Vacation2019" size:"2.95 MB"
            │ │ ├── Beach.jpg LEAF id:15 ag-Grid-AutoColumn:"Beach.jpg" size:"1024 KB"
            │ │ └── Mountain.png LEAF id:16 ag-Grid-AutoColumn:"Mountain.png" size:"1.95 MB"
            │ └─┬ Family filler id:row-group-0-Pictures-1-Family ag-Grid-AutoColumn:"Family" size:"4.88 MB"
            │ · ├── Birthday2022.jpg LEAF id:17 ag-Grid-AutoColumn:"Birthday2022.jpg" size:"2.93 MB"
            │ · └── Christmas2021.png LEAF id:18 ag-Grid-AutoColumn:"Christmas2021.png" size:"1.95 MB"
            ├─┬ Videos filler id:row-group-0-Videos ag-Grid-AutoColumn:"Videos" size:"20 MB"
            │ ├─┬ Vacation2019 filler id:row-group-0-Videos-1-Vacation2019 ag-Grid-AutoColumn:"Vacation2019" size:"8 MB"
            │ │ ├── Beach.mov LEAF id:19 ag-Grid-AutoColumn:"Beach.mov" size:"4 MB"
            │ │ └── Hiking.mp4 LEAF id:20 ag-Grid-AutoColumn:"Hiking.mp4" size:"4 MB"
            │ └─┬ Family filler id:row-group-0-Videos-1-Family ag-Grid-AutoColumn:"Family" size:"12 MB"
            │ · ├── Birthday2022.mp4 LEAF id:21 ag-Grid-AutoColumn:"Birthday2022.mp4" size:"6 MB"
            │ · └── Christmas2021.mov LEAF id:22 ag-Grid-AutoColumn:"Christmas2021.mov" size:"6 MB"
            └─┬ Downloads filler id:row-group-0-Downloads ag-Grid-AutoColumn:"Downloads" size:"4 MB"
            · ├── SoftwareInstaller.exe LEAF id:23 ag-Grid-AutoColumn:"SoftwareInstaller.exe" size:"2 MB"
            · ├── Receipt_OnlineStore.pdf LEAF id:24 ag-Grid-AutoColumn:"Receipt_OnlineStore.pdf" size:"1024 KB"
            · └── Ebook.pdf LEAF id:25 ag-Grid-AutoColumn:"Ebook.pdf" size:"1024 KB"
        `);

        api.applyColumnState({
            state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }],
        });

        await new GridRows(api, 'sort asc').check(`
            ROOT id:ROOT_NODE_ID size:"NaN KB"
            ├─┬ Desktop filler id:row-group-0-Desktop ag-Grid-AutoColumn:"Desktop" size:"1.98 MB"
            │ ├── MeetingNotes_August.pdf LEAF id:4 ag-Grid-AutoColumn:"MeetingNotes_August.pdf" size:"450 KB"
            │ ├─┬ ProjectAlpha filler id:row-group-0-Desktop-1-ProjectAlpha ag-Grid-AutoColumn:"ProjectAlpha" size:"1.49 MB"
            │ │ ├── Proposal.docx LEAF id:1 ag-Grid-AutoColumn:"Proposal.docx" size:"500 KB"
            │ │ └── Timeline.xlsx LEAF id:2 ag-Grid-AutoColumn:"Timeline.xlsx" size:"1024 KB"
            │ └── ToDoList.txt LEAF id:3 ag-Grid-AutoColumn:"ToDoList.txt" size:"50 KB"
            ├─┬ Documents filler id:row-group-0-Documents ag-Grid-AutoColumn:"Documents" size:"7.91 MB"
            │ ├─┬ Personal filler id:row-group-0-Documents-1-Personal ag-Grid-AutoColumn:"Personal" size:"2.95 MB"
            │ │ └─┬ Taxes filler id:row-group-0-Documents-1-Personal-2-Taxes ag-Grid-AutoColumn:"Taxes" size:"2.95 MB"
            │ │ · ├── "2020.pdf" LEAF id:14 ag-Grid-AutoColumn:"2020.pdf" size:"1000 KB"
            │ │ · ├── "2021.pdf" LEAF id:13 ag-Grid-AutoColumn:"2021.pdf" size:"1024 KB"
            │ │ · └── "2022.pdf" LEAF id:12 ag-Grid-AutoColumn:"2022.pdf" size:"1000 KB"
            │ └─┬ Work filler id:row-group-0-Documents-1-Work ag-Grid-AutoColumn:"Work" size:"4.95 MB"
            │ · ├─┬ Meetings filler id:row-group-0-Documents-1-Work-2-Meetings ag-Grid-AutoColumn:"Meetings" size:"1.49 MB"
            │ · │ ├── ClientMeeting_July.pdf LEAF id:11 ag-Grid-AutoColumn:"ClientMeeting_July.pdf" size:"1024 KB"
            │ · │ └── TeamMeeting_August.pdf LEAF id:10 ag-Grid-AutoColumn:"TeamMeeting_August.pdf" size:"500 KB"
            │ · ├─┬ ProjectAlpha GROUP id:5 ag-Grid-AutoColumn:"ProjectAlpha" size:"1.49 MB"
            │ · │ ├── Proposal.docx LEAF id:6 ag-Grid-AutoColumn:"Proposal.docx" size:"500 KB"
            │ · │ └── Timeline.xlsx LEAF id:7 ag-Grid-AutoColumn:"Timeline.xlsx" size:"1024 KB"
            │ · └─┬ ProjectBeta filler id:row-group-0-Documents-1-Work-2-ProjectBeta ag-Grid-AutoColumn:"ProjectBeta" size:"1.98 MB"
            │ · · ├── Budget.xlsx LEAF id:9 ag-Grid-AutoColumn:"Budget.xlsx" size:"1024 KB"
            │ · · └── Report.pdf LEAF id:8 ag-Grid-AutoColumn:"Report.pdf" size:"1000 KB"
            ├─┬ Downloads filler id:row-group-0-Downloads ag-Grid-AutoColumn:"Downloads" size:"4 MB"
            │ ├── Ebook.pdf LEAF id:25 ag-Grid-AutoColumn:"Ebook.pdf" size:"1024 KB"
            │ ├── Receipt_OnlineStore.pdf LEAF id:24 ag-Grid-AutoColumn:"Receipt_OnlineStore.pdf" size:"1024 KB"
            │ └── SoftwareInstaller.exe LEAF id:23 ag-Grid-AutoColumn:"SoftwareInstaller.exe" size:"2 MB"
            ├─┬ Pictures filler id:row-group-0-Pictures ag-Grid-AutoColumn:"Pictures" size:"7.84 MB"
            │ ├─┬ Family filler id:row-group-0-Pictures-1-Family ag-Grid-AutoColumn:"Family" size:"4.88 MB"
            │ │ ├── Birthday2022.jpg LEAF id:17 ag-Grid-AutoColumn:"Birthday2022.jpg" size:"2.93 MB"
            │ │ └── Christmas2021.png LEAF id:18 ag-Grid-AutoColumn:"Christmas2021.png" size:"1.95 MB"
            │ └─┬ Vacation2019 filler id:row-group-0-Pictures-1-Vacation2019 ag-Grid-AutoColumn:"Vacation2019" size:"2.95 MB"
            │ · ├── Beach.jpg LEAF id:15 ag-Grid-AutoColumn:"Beach.jpg" size:"1024 KB"
            │ · └── Mountain.png LEAF id:16 ag-Grid-AutoColumn:"Mountain.png" size:"1.95 MB"
            └─┬ Videos filler id:row-group-0-Videos ag-Grid-AutoColumn:"Videos" size:"20 MB"
            · ├─┬ Family filler id:row-group-0-Videos-1-Family ag-Grid-AutoColumn:"Family" size:"12 MB"
            · │ ├── Birthday2022.mp4 LEAF id:21 ag-Grid-AutoColumn:"Birthday2022.mp4" size:"6 MB"
            · │ └── Christmas2021.mov LEAF id:22 ag-Grid-AutoColumn:"Christmas2021.mov" size:"6 MB"
            · └─┬ Vacation2019 filler id:row-group-0-Videos-1-Vacation2019 ag-Grid-AutoColumn:"Vacation2019" size:"8 MB"
            · · ├── Beach.mov LEAF id:19 ag-Grid-AutoColumn:"Beach.mov" size:"4 MB"
            · · └── Hiking.mp4 LEAF id:20 ag-Grid-AutoColumn:"Hiking.mp4" size:"4 MB"
        `);

        api.applyColumnState({
            state: [{ colId: 'ag-Grid-AutoColumn', sort: 'desc' }],
        });

        await new GridRows(api, 'sort desc').check(`
            ROOT id:ROOT_NODE_ID size:"NaN KB"
            ├─┬ Videos filler id:row-group-0-Videos ag-Grid-AutoColumn:"Videos" size:"20 MB"
            │ ├─┬ Vacation2019 filler id:row-group-0-Videos-1-Vacation2019 ag-Grid-AutoColumn:"Vacation2019" size:"8 MB"
            │ │ ├── Hiking.mp4 LEAF id:20 ag-Grid-AutoColumn:"Hiking.mp4" size:"4 MB"
            │ │ └── Beach.mov LEAF id:19 ag-Grid-AutoColumn:"Beach.mov" size:"4 MB"
            │ └─┬ Family filler id:row-group-0-Videos-1-Family ag-Grid-AutoColumn:"Family" size:"12 MB"
            │ · ├── Christmas2021.mov LEAF id:22 ag-Grid-AutoColumn:"Christmas2021.mov" size:"6 MB"
            │ · └── Birthday2022.mp4 LEAF id:21 ag-Grid-AutoColumn:"Birthday2022.mp4" size:"6 MB"
            ├─┬ Pictures filler id:row-group-0-Pictures ag-Grid-AutoColumn:"Pictures" size:"7.84 MB"
            │ ├─┬ Vacation2019 filler id:row-group-0-Pictures-1-Vacation2019 ag-Grid-AutoColumn:"Vacation2019" size:"2.95 MB"
            │ │ ├── Mountain.png LEAF id:16 ag-Grid-AutoColumn:"Mountain.png" size:"1.95 MB"
            │ │ └── Beach.jpg LEAF id:15 ag-Grid-AutoColumn:"Beach.jpg" size:"1024 KB"
            │ └─┬ Family filler id:row-group-0-Pictures-1-Family ag-Grid-AutoColumn:"Family" size:"4.88 MB"
            │ · ├── Christmas2021.png LEAF id:18 ag-Grid-AutoColumn:"Christmas2021.png" size:"1.95 MB"
            │ · └── Birthday2022.jpg LEAF id:17 ag-Grid-AutoColumn:"Birthday2022.jpg" size:"2.93 MB"
            ├─┬ Downloads filler id:row-group-0-Downloads ag-Grid-AutoColumn:"Downloads" size:"4 MB"
            │ ├── SoftwareInstaller.exe LEAF id:23 ag-Grid-AutoColumn:"SoftwareInstaller.exe" size:"2 MB"
            │ ├── Receipt_OnlineStore.pdf LEAF id:24 ag-Grid-AutoColumn:"Receipt_OnlineStore.pdf" size:"1024 KB"
            │ └── Ebook.pdf LEAF id:25 ag-Grid-AutoColumn:"Ebook.pdf" size:"1024 KB"
            ├─┬ Documents filler id:row-group-0-Documents ag-Grid-AutoColumn:"Documents" size:"7.91 MB"
            │ ├─┬ Work filler id:row-group-0-Documents-1-Work ag-Grid-AutoColumn:"Work" size:"4.95 MB"
            │ │ ├─┬ ProjectBeta filler id:row-group-0-Documents-1-Work-2-ProjectBeta ag-Grid-AutoColumn:"ProjectBeta" size:"1.98 MB"
            │ │ │ ├── Report.pdf LEAF id:8 ag-Grid-AutoColumn:"Report.pdf" size:"1000 KB"
            │ │ │ └── Budget.xlsx LEAF id:9 ag-Grid-AutoColumn:"Budget.xlsx" size:"1024 KB"
            │ │ ├─┬ ProjectAlpha GROUP id:5 ag-Grid-AutoColumn:"ProjectAlpha" size:"1.49 MB"
            │ │ │ ├── Timeline.xlsx LEAF id:7 ag-Grid-AutoColumn:"Timeline.xlsx" size:"1024 KB"
            │ │ │ └── Proposal.docx LEAF id:6 ag-Grid-AutoColumn:"Proposal.docx" size:"500 KB"
            │ │ └─┬ Meetings filler id:row-group-0-Documents-1-Work-2-Meetings ag-Grid-AutoColumn:"Meetings" size:"1.49 MB"
            │ │ · ├── TeamMeeting_August.pdf LEAF id:10 ag-Grid-AutoColumn:"TeamMeeting_August.pdf" size:"500 KB"
            │ │ · └── ClientMeeting_July.pdf LEAF id:11 ag-Grid-AutoColumn:"ClientMeeting_July.pdf" size:"1024 KB"
            │ └─┬ Personal filler id:row-group-0-Documents-1-Personal ag-Grid-AutoColumn:"Personal" size:"2.95 MB"
            │ · └─┬ Taxes filler id:row-group-0-Documents-1-Personal-2-Taxes ag-Grid-AutoColumn:"Taxes" size:"2.95 MB"
            │ · · ├── "2022.pdf" LEAF id:12 ag-Grid-AutoColumn:"2022.pdf" size:"1000 KB"
            │ · · ├── "2021.pdf" LEAF id:13 ag-Grid-AutoColumn:"2021.pdf" size:"1024 KB"
            │ · · └── "2020.pdf" LEAF id:14 ag-Grid-AutoColumn:"2020.pdf" size:"1000 KB"
            └─┬ Desktop filler id:row-group-0-Desktop ag-Grid-AutoColumn:"Desktop" size:"1.98 MB"
            · ├── ToDoList.txt LEAF id:3 ag-Grid-AutoColumn:"ToDoList.txt" size:"50 KB"
            · ├─┬ ProjectAlpha filler id:row-group-0-Desktop-1-ProjectAlpha ag-Grid-AutoColumn:"ProjectAlpha" size:"1.49 MB"
            · │ ├── Timeline.xlsx LEAF id:2 ag-Grid-AutoColumn:"Timeline.xlsx" size:"1024 KB"
            · │ └── Proposal.docx LEAF id:1 ag-Grid-AutoColumn:"Proposal.docx" size:"500 KB"
            · └── MeetingNotes_August.pdf LEAF id:4 ag-Grid-AutoColumn:"MeetingNotes_August.pdf" size:"450 KB"
        `);
    });

    test.only('auto group column respects value getter comparator', async () => {
        const rowData = [
            { id: 'a', path: ['Root', 'AlphaLong'], label: 'AlphaLong' },
            { id: 'b', path: ['Root', 'Zed'], label: 'Zed' },
            { id: 'c', path: ['Root', 'Gamma'], label: 'Gamma' },
        ];

        const api = gridsManager.createGrid('valueGetterComparator', {
            columnDefs: [{ field: 'label' }],
            autoGroupColumnDef: {
                comparator: (valueA, valueB) => {
                    const aValue = valueA == null ? '' : String(valueA);
                    const bValue = valueB == null ? '' : String(valueB);
                    return aValue.length - bValue.length || aValue.localeCompare(bValue);
                },
                valueGetter: (params) => {
                    return params.data?.label ?? params.node?.key;
                },
            },
            groupDefaultExpanded: -1,
            treeData: true,
            getDataPath: (data) => data.path,
            getRowId: (params) => params.data.id,
            rowData,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:null
            └─┬ Root filler id:row-group-0-Root ag-Grid-AutoColumn:"Root"
            · ├── AlphaLong LEAF id:a ag-Grid-AutoColumn:"AlphaLong" label:"AlphaLong"
            · ├── Zed LEAF id:b ag-Grid-AutoColumn:"Zed" label:"Zed"
            · └── Gamma LEAF id:c ag-Grid-AutoColumn:"Gamma" label:"Gamma"
        `);

        api.applyColumnState({
            state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }],
        });

        await new GridRows(api, 'valueGetter asc').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:null
            └─┬ Root filler id:row-group-0-Root ag-Grid-AutoColumn:"Root"
            · ├── Zed LEAF id:b ag-Grid-AutoColumn:"Zed" label:"Zed"
            · ├── Gamma LEAF id:c ag-Grid-AutoColumn:"Gamma" label:"Gamma"
            · └── AlphaLong LEAF id:a ag-Grid-AutoColumn:"AlphaLong" label:"AlphaLong"
        `);

        api.applyColumnState({
            state: [{ colId: 'ag-Grid-AutoColumn', sort: 'desc' }],
        });

        await new GridRows(api, 'valueGetter desc').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:null
            └─┬ Root filler id:row-group-0-Root ag-Grid-AutoColumn:"Root"
            · ├── AlphaLong LEAF id:a ag-Grid-AutoColumn:"AlphaLong" label:"AlphaLong"
            · ├── Gamma LEAF id:c ag-Grid-AutoColumn:"Gamma" label:"Gamma"
            · └── Zed LEAF id:b ag-Grid-AutoColumn:"Zed" label:"Zed"
        `);
    });
});

import type {
    CellNote,
    ColDef,
    GetRowIdParams,
    GridOptions,
    ICellRendererComp,
    ICellRendererParams,
    IsFullWidthRowParams,
    NotesDataSource,
    RowHeightParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ContextMenuModule, NotesModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ContextMenuModule,
    NotesModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface OlympicWinner extends Partial<IOlympicData> {
    id: string;
    featured?: boolean;
}

const FULL_WIDTH_NOTE_COLUMN = 'athlete';

const getNoteKey = (rowId: string, colId: string) => `${rowId}::${colId}`;

const noteStore = new Map<string, CellNote>([
    [
        getNoteKey('2', FULL_WIDTH_NOTE_COLUMN),
        {
            text: 'This note belongs to a full width row. In this grid, full width notes resolve to the first displayed column.',
        },
    ],
    [
        getNoteKey('4', 'country'),
        {
            text: 'Regular rows still use their actual column id.',
        },
    ],
]);

const notesDataSource: NotesDataSource = {
    getNote: ({ rowNode, column }) => noteStore.get(getNoteKey(rowNode.id!, column.getColId())),
    setNote: ({ rowNode, column, note }) => {
        const key = getNoteKey(rowNode.id!, column.getColId());

        if (note === undefined) {
            noteStore.delete(key);
        } else {
            noteStore.set(key, note);
        }
    },
};

class FullWidthCellRenderer implements ICellRendererComp {
    private eGui!: HTMLElement;

    public init(params: ICellRendererParams<OlympicWinner>): void {
        const data = params.data!;
        const eGui = document.createElement('div');
        eGui.className = 'notes-full-width-row';
        eGui.innerHTML = `
            <div class="notes-full-width-row__title">${data.athlete}</div>
            <div class="notes-full-width-row__details">
                <span>${data.country}</span>
                <span>${data.year}</span>
                <span>${data.sport}</span>
            </div>
        `;
        this.eGui = eGui;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(): boolean {
        return false;
    }
}

const columnDefs: ColDef<OlympicWinner>[] = [
    { field: 'athlete' },
    { field: 'age', maxWidth: 110 },
    { field: 'country' },
    { field: 'year', maxWidth: 110 },
    { field: 'sport' },
];

const rowData: OlympicWinner[] = [
    {
        id: '1',
        athlete: 'Michael Phelps',
        age: 23,
        country: 'United States',
        year: 2008,
        sport: 'Swimming',
    },
    {
        id: '2',
        athlete: 'Usain Bolt',
        age: 22,
        country: 'Jamaica',
        year: 2008,
        sport: 'Athletics',
        featured: true,
    },
    {
        id: '3',
        athlete: 'Simone Biles',
        age: 19,
        country: 'United States',
        year: 2016,
        sport: 'Gymnastics',
    },
    {
        id: '4',
        athlete: 'Katie Ledecky',
        age: 19,
        country: 'United States',
        year: 2016,
        sport: 'Swimming',
    },
    {
        id: '5',
        athlete: 'Allyson Felix',
        age: 30,
        country: 'United States',
        year: 2016,
        sport: 'Athletics',
        featured: true,
    },
    {
        id: '6',
        athlete: 'Mo Farah',
        age: 33,
        country: 'Great Britain',
        year: 2016,
        sport: 'Athletics',
    },
];

const gridOptions: GridOptions<OlympicWinner> = {
    columnDefs,
    rowData,
    getRowId: ({ data }: GetRowIdParams<OlympicWinner>) => data.id,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    notesDataSource,
    getRowHeight: (params: RowHeightParams<OlympicWinner>) => {
        if (params.data?.featured) {
            return 96;
        }
    },
    isFullWidthRow: (params: IsFullWidthRowParams<OlympicWinner>) => !!params.rowNode.data?.featured,
    fullWidthCellRenderer: FullWidthCellRenderer,
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});

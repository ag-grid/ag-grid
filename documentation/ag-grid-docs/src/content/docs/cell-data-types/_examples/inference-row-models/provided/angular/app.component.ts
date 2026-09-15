import { Component, signal } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type {
    ColDef,
    HeaderValueGetterParams,
    IGetRowsParams,
    IServerSideGetRowsParams,
    IViewportDatasource,
    IViewportDatasourceParams,
} from 'ag-grid-community';
import {
    CheckboxEditorModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    DateEditorModule,
    DateFilterModule,
    InfiniteRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule, ViewportRowModelModule } from 'ag-grid-enterprise';

import { ROW_DATA, getSortModel, queryRows } from './data';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ColumnApiModule,
    CheckboxEditorModule,
    DateEditorModule,
    DateFilterModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    ServerSideRowModelModule,
    ViewportRowModelModule,
    RowGroupingModule,
]);

type RowModel = 'clientSide' | 'infinite' | 'serverSide' | 'viewport';

/** No column declares `cellDataType`, so every type is inferred from the data. */
function getColumnDefs(rowModel: RowModel): ColDef[] {
    // The Server-Side Row Model groups by `dateStr`, so inference there waits for the leaf rows
    const grouped: ColDef = rowModel === 'serverSide' ? { rowGroup: true, hide: true } : {};
    return [
        { field: 'athlete', headerName: 'Athlete' },
        { field: 'age', headerName: 'Age' },
        { field: 'date', headerName: 'Date' },
        { field: 'dateStr', headerName: 'Date (String)', ...grouped },
        { field: 'hasGold', headerName: 'Gold' },
    ];
}

/** Shows each column's inferred type in its header, which is the point of the example. */
function headerValueGetter(params: HeaderValueGetterParams): string {
    const { headerName, cellDataType } = params.colDef ?? {};
    if (cellDataType === undefined) {
        return headerName ?? '';
    }
    return `${headerName} (${cellDataType === false ? 'not inferred yet' : cellDataType})`;
}

const BLOCK_SIZE = 4;

/** Serves the block asked for, from the rows left by the filter and sort the grid passed on. */
function getBlock(params: IGetRowsParams): void {
    const rows = queryRows(params.filterModel, params.sortModel);
    setTimeout(() => params.successCallback(rows.slice(params.startRow, params.endRow), rows.length), 200);
}

/**
 * Groups the rows by `dateStr`: the first request returns group rows, which carry only the group key,
 * and expanding a group returns the leaf rows under it.
 */
function getGroupedRows(params: IServerSideGetRowsParams): void {
    const { groupKeys, filterModel, sortModel } = params.request;
    const leaves = queryRows(filterModel as Record<string, any>, sortModel);
    const rows = groupKeys.length
        ? leaves.filter(({ dateStr }) => dateStr === groupKeys[0])
        : [...new Set(leaves.map(({ dateStr }) => dateStr))].map((dateStr) => ({ dateStr }));

    setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 200);
}

/**
 * The viewport datasource is given no filter or sort hook, so the grid's own filter and sort events
 * tell it to push the matching rows again.
 */
function createViewportDatasource(): { datasource: IViewportDatasource; refresh: () => void } {
    let params: IViewportDatasourceParams | undefined;

    const push = () => {
        if (!params) {
            return;
        }
        const rows = queryRows(params.api.getFilterModel(), getSortModel(params.api));
        params.setRowCount(rows.length);
        setTimeout(() => {
            const byIndex: Record<number, any> = {};
            rows.forEach((row, index) => (byIndex[index] = row));
            params!.setRowData(byIndex);
        }, 200);
    };

    return {
        datasource: {
            init: (viewportParams) => {
                params = viewportParams;
                push();
            },
            setViewportRange: () => {},
        },
        refresh: push,
    };
}

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `<div class="example-wrapper">
        <div class="example-controls">
            <span>Row model:</span>
            <label
                ><input
                    type="radio"
                    name="rowModel"
                    value="clientSide"
                    [checked]="rowModel() === 'clientSide'"
                    (change)="onRowModelChange('clientSide')"
                />
                Client-Side</label
            >
            <label
                ><input
                    type="radio"
                    name="rowModel"
                    value="infinite"
                    [checked]="rowModel() === 'infinite'"
                    (change)="onRowModelChange('infinite')"
                />
                Infinite</label
            >
            <label
                ><input
                    type="radio"
                    name="rowModel"
                    value="serverSide"
                    [checked]="rowModel() === 'serverSide'"
                    (change)="onRowModelChange('serverSide')"
                />
                Server-Side</label
            >
            <label
                ><input
                    type="radio"
                    name="rowModel"
                    value="viewport"
                    [checked]="rowModel() === 'viewport'"
                    (change)="onRowModelChange('viewport')"
                />
                Viewport</label
            >
        </div>
        <div id="myGrid">
            @for (model of [rowModel()]; track model) {
                <ag-grid-angular
                    class="grid"
                    [columnDefs]="columnDefs()"
                    [defaultColDef]="defaultColDef"
                    [rowModelType]="model"
                    [suppressSetFilterByDefault]="true"
                    [rowData]="rowData()"
                    [cacheBlockSize]="cacheBlockSize()"
                    [datasource]="datasource()"
                    [serverSideDatasource]="serverSideDatasource()"
                    [viewportDatasource]="viewportDatasource()"
                    (filterChanged)="refreshViewport()"
                    (sortChanged)="refreshViewport()"
                />
            }
        </div>
    </div>`,
})
export class AppComponent {
    rowModel = signal<RowModel>('clientSide');

    // No column declares `cellDataType`, so every type below is inferred from the data
    columnDefs = signal<ColDef[]>(getColumnDefs('clientSide'));

    defaultColDef: ColDef = {
        flex: 1,
        minWidth: 170,
        filter: true,
        editable: true,
        headerValueGetter,
    };

    rowData = signal<any[] | undefined>(ROW_DATA);
    cacheBlockSize = signal<number | undefined>(undefined);
    datasource = signal<any>(undefined);
    serverSideDatasource = signal<any>(undefined);
    viewportDatasource = signal<any>(undefined);
    refreshViewport: () => void = () => {};

    // `rowModelType` is an initial-only option, so switching it recreates the grid
    onRowModelChange(rowModel: RowModel): void {
        this.rowModel.set(rowModel);
        this.columnDefs.set(getColumnDefs(rowModel));
        this.rowData.set(undefined);
        this.cacheBlockSize.set(undefined);
        this.datasource.set(undefined);
        this.serverSideDatasource.set(undefined);
        this.viewportDatasource.set(undefined);

        switch (rowModel) {
            case 'clientSide':
                this.rowData.set(ROW_DATA);
                break;
            case 'infinite':
                this.cacheBlockSize.set(BLOCK_SIZE);
                this.datasource.set({ getRows: getBlock });
                break;
            case 'serverSide':
                this.serverSideDatasource.set({ getRows: getGroupedRows });
                break;
            case 'viewport': {
                const viewport = createViewportDatasource();
                this.viewportDatasource.set(viewport.datasource);
                this.refreshViewport = viewport.refresh;
                break;
            }
        }
    }
}

import type { IViewportDatasource, IViewportDatasourceParams } from 'ag-grid-community';

import type { ServerEvent, createMockServer } from './mock-server';

type MockServer = ReturnType<typeof createMockServer>;

export function createViewportDatasource(mockServer: MockServer): IViewportDatasource {
    // client code (ie your code) will call this constructor, pass in whatever you need for the
    // viewport to do its job
    class ViewportDatasource implements IViewportDatasource {
        private connectionId: number;
        private params!: IViewportDatasourceParams;

        constructor(private mockServer: MockServer) {
            this.connectionId = this.mockServer.connect(this.eventListener.bind(this));
        }

        // gets called by the grid, tells us what rows the grid is displaying, so time for
        // us to tell the server to give us the rows for that displayed range
        setViewportRange(firstRow: number, lastRow: number) {
            console.log('setViewportRange: ' + firstRow + ' to ' + lastRow);
            this.mockServer.setViewportRange(this.connectionId, firstRow, lastRow);
        }

        // gets called by the grid, provides us with the callbacks we need
        init(params: IViewportDatasourceParams) {
            this.params = params;
        }

        // gets called by grid, when grid is destroyed or this datasource is swapped out for another one
        destroy() {
            this.mockServer.disconnect(this.connectionId);
        }

        // manages events back from the server
        eventListener(event: ServerEvent) {
            switch (event.eventType) {
                case 'rowCountChanged':
                    this.onRowCountChanged(event);
                    break;
                case 'rowData':
                    this.onRowData(event);
                    break;
                case 'dataUpdated':
                    this.onDataUpdated(event);
                    break;
            }
        }

        // process rowData event
        onRowData(event: Extract<ServerEvent, { eventType: 'rowData' }>) {
            const rowDataFromServer = event.rowDataMap;
            this.params.setRowData(rowDataFromServer);
        }

        // process dataUpdated event
        onDataUpdated(event: Extract<ServerEvent, { eventType: 'dataUpdated' }>) {
            const that = this;
            event.changes.forEach(function (change) {
                const rowNode = that.params.getRow(change.rowIndex);
                // if the rowNode is missing, it means the grid is not displaying that row.
                // if the data is missing, it means the rowNode is there, but that data has not
                // loaded into it yet, so to early to set delta changes.
                if (!rowNode || !rowNode.data) {
                    return;
                }
                // rowNode.data[change.columnId] = change.newValue;
                // this is a trick, it gets the row to refresh
                rowNode.setDataValue(change.columnId, change.newValue);
            });
        }

        // process rowCount event
        onRowCountChanged(event: Extract<ServerEvent, { eventType: 'rowCountChanged' }>) {
            const rowCountFromServer = event.rowCount;
            // this will get the grid to make set the height of the row container, so we can scroll vertically properly
            this.params.setRowCount(rowCountFromServer);
        }
    }

    return new ViewportDatasource(mockServer);
}

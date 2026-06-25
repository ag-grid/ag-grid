import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    FindFullWidthCellRendererParams,
    GetFindMatchesParams,
    IsFullWidthRowParams,
    ModuleRegistry,
    RowHeightParams,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';

import { getData, getLatinText } from './data';
import { FullWidthCellRenderer } from './full-width-cell-renderer.component';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([FindModule, ToolbarModule, ClientSideRowModelModule]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `<ag-grid-angular
        style="width: 100%; height: 100%;"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [rowData]="rowData"
        [getRowHeight]="getRowHeight"
        [isFullWidthRow]="isFullWidthRow"
        [fullWidthCellRenderer]="fullWidthCellRenderer"
        [fullWidthCellRendererParams]="fullWidthCellRendererParams"
        [toolbar]="toolbar"
    /> `,
})
export class AppComponent {
    columnDefs: ColDef[] = [{ field: 'name' }, { field: 'continent' }, { field: 'language' }];
    defaultColDef: ColDef = {
        flex: 1,
    };
    rowData = getData();
    getRowHeight = (params: RowHeightParams) => {
        // return 100px height for full width rows
        if (this.isFullWidth(params.data)) {
            return 100;
        }
    };
    isFullWidthRow = (params: IsFullWidthRowParams) => {
        return this.isFullWidth(params.rowNode.data);
    };
    fullWidthCellRenderer = FullWidthCellRenderer;
    fullWidthCellRendererParams: FindFullWidthCellRendererParams = {
        getFindMatches: (params: GetFindMatchesParams) => {
            const getMatchesForValue = params.getMatchesForValue;
            // this example only implements searching across part of the renderer
            let numMatches = getMatchesForValue('Sample Text in a Paragraph');
            getLatinText().forEach((paragraph) => {
                numMatches += getMatchesForValue(paragraph);
            });
            return numMatches;
        },
    };

    toolbar = {
        items: ['agFindToolbarItem' as const],
    };

    private isFullWidth(data: any) {
        // return true when country is Peru, France or Italy
        return ['Peru', 'France', 'Italy'].indexOf(data.name) >= 0;
    }
}

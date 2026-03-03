import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';

import { gridOptions } from '../config';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [AgGridAngular],
    template: `<ag-grid-angular [gridOptions]="gridOptions" />`,
})
export class AppComponent {
    gridOptions = gridOptions;
}

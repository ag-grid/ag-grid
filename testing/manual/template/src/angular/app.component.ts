import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { gridOptions } from '../gridOptions';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [AgGridAngular],
    template: `<ag-grid-angular style="height: 100%" [gridOptions]="gridOptions" />`,
})
export class AppComponent {
    gridOptions = gridOptions;
}

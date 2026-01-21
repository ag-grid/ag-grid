import { Component, OnInit, signal } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { ITransaction, generateTransactions } from './generateTransactions';
import { gridOptions } from './gridOptions';
import './styles.css';

ModuleRegistry.registerModules([AllEnterpriseModule]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `
        <div style="width: 100%; height: 100%;">
            <ag-grid-angular style="width: 100%; height: 100%;" [rowData]="rowData()" [gridOptions]="gridOptions" />
        </div>
    `,
})
export class AppComponent implements OnInit {
    gridOptions = gridOptions;
    rowData = signal<ITransaction[]>([]);

    ngOnInit() {
        // Generate synthetic transaction data
        const data = generateTransactions({ count: 10000, seed: 42 });
        this.rowData.set(data);
    }
}

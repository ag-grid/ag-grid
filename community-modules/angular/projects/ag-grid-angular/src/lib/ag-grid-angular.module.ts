import { NgModule } from '@angular/core';
import { AgGridAngular } from './ag-grid-angular.component';

@NgModule({
    imports: [AgGridAngular],
    exports: [AgGridAngular]
})
export class AgGridModule { }

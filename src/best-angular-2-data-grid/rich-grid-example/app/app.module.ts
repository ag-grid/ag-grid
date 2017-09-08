import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms'; // <-- NgModel lives here
// ag-grid
import {AgGridModule} from "ag-grid-angular";

import {RichGridComponent} from "./rich-grid.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule, // <-- import the FormsModule before binding with [(ngModel)]
        AgGridModule.withComponents([
        ])
    ],
    declarations: [
        RichGridComponent,
    ],
    bootstrap: [RichGridComponent]
})
export class AppModule {
}

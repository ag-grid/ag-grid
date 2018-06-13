import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms'; // <-- NgModel lives here
// ag-grid
import {AgGridModule} from "ag-grid-angular";

import {RichGridComponent} from "./rich-grid.component";
import {ProficiencyCellRenderer} from "./proficiency-renderer.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule, // <-- import the FormsModule before binding with [(ngModel)]
        AgGridModule.withComponents([
            ProficiencyCellRenderer
        ])
    ],
    declarations: [
        RichGridComponent,
        ProficiencyCellRenderer
    ],
    bootstrap: [RichGridComponent]
})
export class AppModule {
}

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
// ag-grid
import {AgGridModule} from "ag-grid-angular";

import {RichGridComponent} from "./rich-grid.component";
import {ProficiencyCellRenderer} from "./proficiency-renderer.component";

@NgModule({
    imports: [
        BrowserModule,
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

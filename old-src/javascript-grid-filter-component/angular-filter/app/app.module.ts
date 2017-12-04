import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from '@angular/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular";

// filter
import {FilterComponentComponent} from "./filter.component";
import {PartialMatchFilterComponent} from "./partial-match-filter.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AgGridModule.withComponents(
            [
                PartialMatchFilterComponent
            ])
    ],
    declarations: [
        FilterComponentComponent,
        PartialMatchFilterComponent
    ],
    bootstrap: [FilterComponentComponent]
})
export class AppModule {
}

import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from '@angular/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular";

// floating filter
import {FloatingFilterComponent} from "./floating-filter.component";
import {SliderFloatingFilter} from "./slider-floating-filter.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AgGridModule.withComponents(
            [
                SliderFloatingFilter
            ])
    ],
    declarations: [
        FloatingFilterComponent,
        SliderFloatingFilter
    ],
    bootstrap: [FloatingFilterComponent]
})
export class AppModule {
}

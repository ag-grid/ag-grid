import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from '@angular/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular";

// rxjs
import {RxJsComponentByRow} from "./rxjs-component-example/rxjs-by-row.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        RxJsComponentByRow
    ],
    bootstrap: [RxJsComponentByRow]
})
export class AppModule {
}

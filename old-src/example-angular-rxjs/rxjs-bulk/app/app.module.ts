import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from '@angular/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular";

// rxjs
import {RxJsComponentByFullSet} from "./rxjs-component-example/rxjs-by-bulk.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        RxJsComponentByFullSet
    ],
    bootstrap: [RxJsComponentByFullSet]
})
export class AppModule {
}

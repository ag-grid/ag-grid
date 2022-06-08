import { AgGridModule } from "@ag-grid-community/angular";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RxJsComponentByFullSet } from "./rxjs-component-example/rxjs-by-bulk.component";


@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        AgGridModule
    ],
    declarations: [
        RxJsComponentByFullSet
    ],
    bootstrap: [RxJsComponentByFullSet]
})
export class AppModule {
}

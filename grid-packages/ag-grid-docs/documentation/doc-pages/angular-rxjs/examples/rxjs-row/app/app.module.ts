import { AgGridModule } from "@ag-grid-community/angular";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RxJsComponentByRow } from "./rxjs-component-example/rxjs-by-row.component";

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        AgGridModule
    ],
    declarations: [
        RxJsComponentByRow
    ],
    bootstrap: [RxJsComponentByRow]
})
export class AppModule {
}

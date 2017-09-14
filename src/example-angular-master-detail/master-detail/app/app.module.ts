import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from '@angular/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular";

// master detail
import {MasterComponent} from "./master-detail-example/masterdetail-master.component";
import {DetailPanelComponent} from "./master-detail-example/detail-panel.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AgGridModule.withComponents(
            [
                DetailPanelComponent
            ])
    ],
    declarations: [
        MasterComponent,
        DetailPanelComponent
    ],
    bootstrap: [MasterComponent]
})
export class AppModule {
}

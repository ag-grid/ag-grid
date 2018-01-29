import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from '@angular/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular";

// grouped inner
import {MedalRendererComponent} from "./grouped-row-inner-renderer-example/medal-renderer.component";
import {GroupRowComponent} from "./grouped-row-inner-renderer-example/group-row-renderer.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AgGridModule.withComponents(
            [
                MedalRendererComponent
            ])
    ],
    declarations: [
        GroupRowComponent,
        MedalRendererComponent
    ],
    bootstrap: [GroupRowComponent]
})
export class AppModule {
}

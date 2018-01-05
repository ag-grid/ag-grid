import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from '@angular/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular";

// Pinned Row
import {PinnedRowComponent} from "./pinned-row-example/pinned-row-renderer.component";
import {StyledComponent} from "./pinned-row-example/styled-renderer.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AgGridModule.withComponents(
            [
                StyledComponent
            ])
    ],
    declarations: [
        PinnedRowComponent,
        StyledComponent
    ],
    bootstrap: [PinnedRowComponent]
})
export class AppModule {
}

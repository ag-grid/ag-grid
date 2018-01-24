import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from '@angular/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular";

// full width
import {FullWidthComponent} from "./full-width-example/full-width-renderer.component";
import {NameAndAgeRendererComponent} from "./full-width-example/name-age-renderer.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AgGridModule.withComponents(
            [
                NameAndAgeRendererComponent
            ])
    ],
    declarations: [
        FullWidthComponent,
        NameAndAgeRendererComponent
    ],
    bootstrap: [FullWidthComponent]
})
export class AppModule {
}

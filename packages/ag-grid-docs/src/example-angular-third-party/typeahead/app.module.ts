import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
// ag-grid
import {AgGridModule} from "ag-grid-angular/main";
// application
import {AppComponent} from "./app.component";
// typeahead component
import {TypeaheadComponent} from "./typeahead.component";
import {TypeaheadEditorComponent} from "./typeahead-editor.component";
import {Typeahead} from "ng2-typeahead";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AgGridModule.withComponents(
            [
                TypeaheadEditorComponent
            ])
    ],
    declarations: [
        AppComponent,
        Typeahead,
        TypeaheadComponent,
        TypeaheadEditorComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

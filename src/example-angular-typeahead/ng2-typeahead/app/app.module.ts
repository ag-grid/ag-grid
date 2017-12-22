import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";

// ag-grid
import {AgGridModule} from "ag-grid-angular/main";

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
            ]),
    ],
    declarations: [
        Typeahead,
        TypeaheadComponent,
        TypeaheadEditorComponent
    ],
    bootstrap: [TypeaheadComponent]
})
export class AppModule {
}

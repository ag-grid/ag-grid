import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from '@angular/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular";

// editor
import {EditorComponent} from "./editor.component";
import {NumericEditorComponent} from "./numeric-editor.component";
import {MoodEditorComponent} from "./mood-editor.component";
import {MoodRendererComponent} from "./mood-renderer.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AgGridModule.withComponents(
            [
                NumericEditorComponent,
                MoodEditorComponent,
                MoodRendererComponent
            ]),
    ],
    declarations: [
        EditorComponent,
        NumericEditorComponent,
        MoodEditorComponent,
        MoodRendererComponent
    ],
    bootstrap: [EditorComponent]
})
export class AppModule {
}

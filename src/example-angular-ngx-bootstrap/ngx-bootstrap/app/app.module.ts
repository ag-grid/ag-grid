import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
// ag-grid
import {AgGridModule} from "ag-grid-angular/main";

// ngx bootstrap
import {BsDropdownModule, ButtonsModule, DatepickerModule} from "ngx-bootstrap";
import {BootstrapDatePickerComponent} from "./date-picker.component";
import {BootstrapDropdownComponent} from "./dropdown.component";
import {BootstrapEditorComponent} from "./bootstrap-editor.component";
import {BootstrapRadioComponent} from "./radio-buttons.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AgGridModule.withComponents(
            [
                BootstrapDatePickerComponent,
                BootstrapDropdownComponent,
                BootstrapRadioComponent,
            ]),
        DatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        ButtonsModule.forRoot(),
    ],
    declarations: [
        BootstrapEditorComponent,
        BootstrapDatePickerComponent,
        BootstrapDropdownComponent,
        BootstrapRadioComponent,
    ],
    bootstrap: [BootstrapEditorComponent]
})
export class AppModule {
}

import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
// ag-grid
import {AgGridModule} from "@ag-grid-community/angular";

// material design
import {MatCardModule} from '@angular/material/card';
import {MatSliderModule} from '@angular/material/slider';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatEditorComponentOne} from "./mat-editor-one.component";
import {MatCheckboxComponent} from "./mat-checkbox.component";
import {MatInputComponent} from "./mat-input.component";
import {MatRadioComponent} from "./mat-radio.component";
import {MatSelectComponent} from "./mat-select.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AgGridModule,
        BrowserAnimationsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSliderModule,
        MatCardModule
    ],
    declarations: [
        MatEditorComponentOne,
        MatCheckboxComponent,
        MatInputComponent,
        MatRadioComponent,
        MatSelectComponent
    ],
    bootstrap: [MatEditorComponentOne]
})
export class AppModule {
}

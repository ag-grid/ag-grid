import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
// ag-grid
import { AgGridModule } from "ag-grid-angular/main";

// material design
import {
    MatCardModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule
} from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatEditorComponentOne } from "./mat-editor-one.component";
import { MatCheckboxComponent } from "./mat-checkbox.component";
import { MatInputComponent } from "./mat-input.component";
import { MatRadioComponent } from "./mat-radio.component";
import { MatSelectComponent } from "./mat-select.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AgGridModule.withComponents([MatCheckboxComponent, MatInputComponent, MatRadioComponent, MatSelectComponent]),
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
    declarations: [MatEditorComponentOne, MatCheckboxComponent, MatInputComponent, MatRadioComponent, MatSelectComponent],
    bootstrap: [MatEditorComponentOne]
})
export class AppModule {}

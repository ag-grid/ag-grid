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
import { MatEditorComponentTwo } from "./mat-editor-two.component";
import { MatSliderComponent } from "./mat-slider.component";
import { MatButtonToggleHeaderComponent } from "./mat-button-toggle.component";
import { MatProgressSpinnerComponent } from "./mat-progress-spinner.component";
import { ColumnAlignmentService } from "./columnAlignmentService";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AgGridModule.withComponents([MatSliderComponent, MatButtonToggleHeaderComponent, MatProgressSpinnerComponent]),
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
    declarations: [MatEditorComponentTwo, MatSliderComponent, MatButtonToggleHeaderComponent, MatProgressSpinnerComponent],
    providers: [ColumnAlignmentService],
    bootstrap: [MatEditorComponentTwo]
})
export class AppModule {}

import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
// ag-grid
import { AgGridModule } from "@ag-grid-community/angular";

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
    declarations: [MatEditorComponentTwo, MatSliderComponent, MatButtonToggleHeaderComponent, MatProgressSpinnerComponent],
    providers: [ColumnAlignmentService],
    bootstrap: [MatEditorComponentTwo]
})
export class AppModule {}

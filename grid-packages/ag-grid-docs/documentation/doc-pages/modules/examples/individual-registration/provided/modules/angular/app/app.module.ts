import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// ag-grid
import { AgGridModule } from "@ag-grid-community/angular";

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    AgGridModule
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

// ag-grid
import { AgGridModule } from "@ag-grid-community/angular";
import { SportRenderer, AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    AgGridModule
  ],
  declarations: [
    AppComponent,
    SportRenderer
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

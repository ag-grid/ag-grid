import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { AppComponent } from './app.component';


        @NgModule({
          imports: [
            BrowserModule,
            AgChartsAngularModule
          ],
          declarations: [
            AppComponent
          ],
          bootstrap: [ AppComponent ]
        })
        export class AppModule { }
    
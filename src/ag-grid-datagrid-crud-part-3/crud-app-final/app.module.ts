import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';

import {AgGridModule} from 'ag-grid-angular';

import {AppComponent} from './app.component';
import {AthleteService} from './services/athlete.service';
import {GridComponent} from './grid/grid.component';

@NgModule({
    declarations: [
        AppComponent,
        GridComponent,
    ],
    imports: [
        BrowserModule,
        HttpModule,
        AgGridModule.withComponents([])
    ],
    providers: [AthleteService],
    bootstrap: [AppComponent]
})
export class AppModule {
}

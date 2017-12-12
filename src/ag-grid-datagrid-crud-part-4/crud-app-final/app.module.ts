import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';

import {AgGridModule} from 'ag-grid-angular';

import {AthleteService} from './services/athlete.service';
import {StaticDataService} from './services/static-data.service';

import {AppComponent} from './app.component';
import {GridComponent} from './grid/grid.component';
import {AthleteEditScreenComponent} from './athlete-edit-screen/athlete-edit-screen.component';

@NgModule({
    declarations: [
        AppComponent,
        GridComponent,
        AthleteEditScreenComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        AgGridModule.withComponents([])
    ],
    providers: [
        AthleteService,
        StaticDataService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

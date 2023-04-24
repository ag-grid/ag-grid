import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

// ag-grid
import { AgGridModule } from '@ag-grid-community/angular';
import { AppComponent } from './app.component';

import { DaysFrostRenderer } from './days-frost-renderer.component';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        AgGridModule
    ],
    declarations: [
        AppComponent, DaysFrostRenderer
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

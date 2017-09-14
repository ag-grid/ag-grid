import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms'; // <-- NgModel lives here

// ag-grid
import {AgGridModule} from "ag-grid-angular";

import {RichGridDeclarativeComponent} from "./rich-grid-declarative.component";
import {DateComponent} from "./date-component/date.component";
import {HeaderComponent} from "./header-component/header.component";
import {HeaderGroupComponent} from "./header-group-component/header-group.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule, // <-- import the FormsModule before binding with [(ngModel)]
        AgGridModule.withComponents([
            DateComponent,
            HeaderComponent,
            HeaderGroupComponent,
        ])
    ],
    declarations: [
        RichGridDeclarativeComponent,
        DateComponent,
        HeaderComponent,
        HeaderGroupComponent,
    ],
    bootstrap: [RichGridDeclarativeComponent]
})
export class AppModule {
}

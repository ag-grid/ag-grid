import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AgGridModule} from 'ag-grid-ng2/main';

import {AppComponent} from "./app.component";
import {RichGridComponent} from "./rich-grid.component";
import {FromComponentComponent} from "./from-component.component";
import {FromTemplateComponent} from "./from-template.component";
import {FromRichComponent} from "./from-rich.component";
import {RatioModule} from "./ratio.module";
import {ClickableModule} from "./clickable.module";
import {EditorComponent} from "./editor-component.component";
import {WithFloatingRowComponent} from "./floating-row-renderer.component";
import {WithFullWidthComponent} from "./full-width-renderer.component";
import {WithGroupRowComponent} from "./group-row-renderer.component";
import {FilterComponentComponent} from "./filter-component.component";
import {RichGridDeclarativeComponent} from "./rich-grid-declarative.component";

@NgModule({
    imports: [
        BrowserModule,
        AgGridModule.withNg2ComponentSupport(),
        RatioModule,
        ClickableModule
    ],
    declarations: [
        AppComponent,
        RichGridComponent,
        FromComponentComponent,
        FromTemplateComponent,
        FromRichComponent,
        EditorComponent,
        WithFloatingRowComponent,
        WithFullWidthComponent,
        WithGroupRowComponent,
        FilterComponentComponent,
        RichGridDeclarativeComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

// ag-grid
import { AgGridModule } from "@ag-grid-community/angular";

// from rich component
import { RichComponent } from "./rich.component";
import { ClickableModule } from "./clickable.module";
import { RatioModule } from "./ratio.module";
import { RatioParentComponent } from "./ratio.parent.component";
import { ClickableParentComponent } from "./clickable.parent.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AgGridModule,
        RatioModule,
        ClickableModule
    ],
    declarations: [
        RichComponent
    ],
    bootstrap: [RichComponent]
})
export class AppModule {
}

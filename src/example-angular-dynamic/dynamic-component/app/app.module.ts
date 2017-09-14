import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from '@angular/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular";

// from component
import {DynamicComponent} from "./dynamic.component";
import {SquareComponent} from "./square.component";
import {ParamsComponent} from "./params.component";
import {CubeComponent} from "./cube.component";
import {CurrencyComponent} from "./currency.component";
import {ChildMessageComponent} from "./child-message.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AgGridModule.withComponents(
            [
                SquareComponent,
                CubeComponent,
                ParamsComponent,
                CurrencyComponent,
                ChildMessageComponent
            ])
    ],
    declarations: [
        DynamicComponent,
        SquareComponent,
        CubeComponent,
        ParamsComponent,
        CurrencyComponent,
        ChildMessageComponent
    ],
    bootstrap: [DynamicComponent]
})
export class AppModule {
}

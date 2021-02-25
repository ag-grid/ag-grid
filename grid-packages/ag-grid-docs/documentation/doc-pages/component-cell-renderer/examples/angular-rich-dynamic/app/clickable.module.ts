import {NgModule} from "@angular/core";

import {ClickableComponent} from "./clickable.component";
import {ClickableParentComponent} from "./clickable.parent.component";

@NgModule({
    imports: [],
    declarations: [
        ClickableComponent,
        ClickableParentComponent
    ],
    exports: [
        ClickableParentComponent
    ]
})
export class ClickableModule {
}

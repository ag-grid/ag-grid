import {NgModule} from "@angular/core";

import {RatioComponent} from "./ratio.component";
import {RatioParentComponent} from "./ratio.parent.component";

@NgModule({
    imports: [],
    declarations: [
        RatioComponent,
        RatioParentComponent
    ],
    exports: [
        RatioParentComponent
    ]
})
export class RatioModule {
}

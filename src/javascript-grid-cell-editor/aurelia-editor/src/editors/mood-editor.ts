import {bindable, customElement, inject} from "aurelia-framework";

import {BaseAureliaEditor} from "ag-grid-aurelia";

@customElement('ag-mood-editor')
@inject(Element)
export class MoodEditor extends BaseAureliaEditor {
    params: any;

    @bindable() happy: boolean = false;
    @bindable() hasFocus: boolean = false;

    element: any;

    constructor(element) {
        super();

        this.element = element;
    }

    attached(): void {
        this.setHappy(this.params.value === "Happy");
        this.hasFocus = true;
    }

    getValue(): any {
        return this.happy ? "Happy" : "Sad";
    }

    isPopup(): boolean {
        return true;
    }

    setHappy(happy: boolean): void {
        this.happy = happy;
    }

    toggleMood(): void {
        this.setHappy(!this.happy);
    }

    onKeyDown(event): void {
        let key = event.which || event.keyCode;
        if (key == 37 ||  // left
            key == 39) {  // right
            this.toggleMood();
            event.stopPropagation();
        }
    }
}

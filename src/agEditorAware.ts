
import {AgAware} from "./agAware";
export interface AgEditorAware extends AgAware {
    getValue() : any;
    isPopup?(): boolean;

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
}

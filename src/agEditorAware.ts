
import {AgAware} from "./agAware";
export interface AgEditorAware extends AgAware {
    getValue() : any;
    isPopup?(): boolean;
}
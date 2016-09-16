import {AgFrameworkComponent} from "./agFrameworkComponent";

export interface AgEditorComponent extends AgFrameworkComponent<any> {
    agInit(params:any) : void;                  // for clarity
    getValue() : any;
    isPopup?(): boolean;
    isCancelBeforeStart?(): boolean;
    isCancelAfterEnd?(): boolean;

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
}

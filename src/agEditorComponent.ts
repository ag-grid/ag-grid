import {AgFrameworkComponent} from "./agFrameworkComponent";

export interface AgEditorComponent extends AgFrameworkComponent {
    agInit(params:any) : void;                  // for clarity
    getFrameworkComponentInstance() : any;      // for clarity
    getValue() : any;
    isPopup?(): boolean;
    isCancelBeforeStart?(): boolean;
    isCancelAfterEnd?(): boolean;

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
}

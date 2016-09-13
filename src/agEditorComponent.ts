
export interface AgEditorComponent {
    agInit(params:any) : void;
    getValue() : any;
    isPopup?(): boolean;
    isCancelBeforeStart?(): boolean;
    isCancelAfterEnd?(): boolean;

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
}

import {Component} from "../../widgets/component";
import {ICellEditor, ICellEditorParams} from "./iCellEditor";

export class PopupEditorWrapper extends Component implements ICellEditor {

    private cellEditor: ICellEditor;
    private params: any;
    private getGuiCalledOnChild = false;
    
    constructor(cellEditor: ICellEditor) {
        super('<div class="ag-popup-editor"/>');
        
        this.cellEditor = cellEditor;
        
        this.addDestroyFunc( ()=> cellEditor.destroy() );

        this.addDestroyableEventListener(
            // this needs to be 'super' and not 'this' as if we call 'this',
            // it ends up called 'getGui()' on the child before 'init' was called,
            // which is not good
            super.getGui(),
            'keydown',
            this.onKeyDown.bind(this)
        );
    }

    private onKeyDown(event: KeyboardEvent): void {
        this.params.onKeyDown(event);
    }

    public getGui(): HTMLElement {
        
        // we call getGui() on child here (rather than in the constructor)
        // as we should wait for 'init' to be called on child first.
        if (!this.getGuiCalledOnChild) {
            this.appendChild(this.cellEditor.getGui());
            this.getGuiCalledOnChild = true;
        }
        
        return super.getGui();
    }
    
    public init(params: ICellEditorParams): void {
        this.params = params;
        if (this.cellEditor.init) {
            this.cellEditor.init(params);
        }
    }

    public afterGuiAttached(): void {
        if (this.cellEditor.afterGuiAttached) {
            this.cellEditor.afterGuiAttached();
        }
    }

    public getValue(): any {
        return this.cellEditor.getValue();
    }

    public isPopup(): boolean {
        return true;
    }

    public isCancelBeforeStart(): boolean {
        if (this.cellEditor.isCancelBeforeStart) {
            return this.cellEditor.isCancelBeforeStart();
        }
    }

    public isCancelAfterEnd(): boolean {
        if (this.cellEditor.isCancelAfterEnd) {
            return this.cellEditor.isCancelAfterEnd();
        }
    }

}
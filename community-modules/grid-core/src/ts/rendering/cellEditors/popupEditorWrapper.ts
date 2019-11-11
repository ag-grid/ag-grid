import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { Autowired } from "../../context/context";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { _ } from "../../utils";

export class PopupEditorWrapper extends PopupComponent implements ICellEditorComp {

    private cellEditor: ICellEditorComp;
    private params: any;
    private getGuiCalledOnChild = false;

    public static DOM_KEY_POPUP_EDITOR_WRAPPER = 'popupEditorWrapper';

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    constructor(cellEditor: ICellEditorComp) {
        super(`<div class="ag-popup-editor" tabindex="-1"/>`);
        this.cellEditor = cellEditor;
    }

    private onKeyDown(event: KeyboardEvent): void {
        if (!_.isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, event, this.params.node, this.params.column, true)) {
            this.params.onKeyDown(event);
        }
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
        this.gridOptionsWrapper.setDomData(this.getGui(), PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER, true);

        this.addDestroyFunc(() => {
                if (this.cellEditor.destroy) {
                    this.cellEditor.destroy();
                }
            }
        );

        this.addDestroyableEventListener(
            // this needs to be 'super' and not 'this' as if we call 'this',
            // it ends up called 'getGui()' on the child before 'init' was called,
            // which is not good
            super.getGui(),
            'keydown',
            this.onKeyDown.bind(this)
        );

    }

    public afterGuiAttached(): void {
        if (this.cellEditor.afterGuiAttached) {
            this.cellEditor.afterGuiAttached();
        }
    }

    public getValue(): any {
        return this.cellEditor.getValue();
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

    public focusIn(): void {
        if (this.cellEditor.focusIn) {
            this.cellEditor.focusIn();
        }
    }

    public focusOut(): void {
        if (this.cellEditor.focusOut) {
            this.cellEditor.focusOut();
        }
    }

}
import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { isUserSuppressingKeyboardEvent } from "../../utils/keyboard";
import { PostConstruct } from "../../context/context";

export class PopupEditorWrapper extends PopupComponent {

    public static DOM_KEY_POPUP_EDITOR_WRAPPER = 'popupEditorWrapper';

    constructor(params: ICellEditorParams) {
        super(`<div class="ag-popup-editor" tabindex="-1"/>`);

        this.addKeyDownListener(params);
    }

    @PostConstruct
    private postConstruct(): void {
        this.gridOptionsWrapper.setDomData(this.getGui(), PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER, true);
    }

    private addKeyDownListener(params: ICellEditorParams): void {

        const listener = (event: KeyboardEvent) => {
            if (!isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, event, params.node, params.column, true)) {
                params.onKeyDown(event);
            }
        };

        this.addManagedListener(this.getGui(), 'keydown', listener);
    }
}

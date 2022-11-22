import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { isUserSuppressingKeyboardEvent } from "../../utils/keyboard";
import { PostConstruct } from "../../context/context";

export class PopupEditorWrapper extends PopupComponent {

    public static DOM_KEY_POPUP_EDITOR_WRAPPER = 'popupEditorWrapper';

    constructor(private readonly params: ICellEditorParams) {
        super(/* html */`<div class="ag-popup-editor" tabindex="-1"/>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.gridOptionsWrapper.setDomData(this.getGui(), PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER, true);
        this.addKeyDownListener();
    }

    private addKeyDownListener(): void {
        const eGui = this.getGui();
        const params = this.params;
        const listener = (event: KeyboardEvent) => {
            if (!isUserSuppressingKeyboardEvent(this.gridOptionsService, event, params.node, params.column, true)) {
                params.onKeyDown(event);
            }
        };

        this.addManagedListener(eGui, 'keydown', listener);
    }
}

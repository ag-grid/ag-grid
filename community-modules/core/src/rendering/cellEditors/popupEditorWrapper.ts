import type { InternalColumn } from '../../entities/column';
import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import { _isUserSuppressingKeyboardEvent } from '../../utils/keyboard';
import { PopupComponent } from '../../widgets/popupComponent';

export class PopupEditorWrapper extends PopupComponent {
    public static DOM_KEY_POPUP_EDITOR_WRAPPER = 'popupEditorWrapper';

    constructor(private readonly params: ICellEditorParams) {
        super(/* html */ `<div class="ag-popup-editor" tabindex="-1"/>`);
    }

    public postConstruct(): void {
        this.gos.setDomData(this.getGui(), PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER, true);
        this.addKeyDownListener();
    }

    private addKeyDownListener(): void {
        const eGui = this.getGui();
        const params = this.params;
        const listener = (event: KeyboardEvent) => {
            if (!_isUserSuppressingKeyboardEvent(this.gos, event, params.node, params.column as InternalColumn, true)) {
                params.onKeyDown(event);
            }
        };

        this.addManagedListener(eGui, 'keydown', listener);
    }
}

import type { AgColumn } from '../../entities/agColumn';
import { setDomData } from '../../gridOptionsUtils';
import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import { _isUserSuppressingKeyboardEvent } from '../../utils/keyboard';
import { PopupComponent } from '../../widgets/popupComponent';

export class PopupEditorWrapper extends PopupComponent {
    constructor(private readonly params: ICellEditorParams) {
        super(/* html */ `<div class="ag-popup-editor" tabindex="-1"/>`);
    }

    public postConstruct(): void {
        setDomData(this.gos, this.getGui(), 'popupEditorWrapper', true);
        this.addKeyDownListener();
    }

    private addKeyDownListener(): void {
        const eGui = this.getGui();
        const params = this.params;
        const listener = (event: KeyboardEvent) => {
            if (!_isUserSuppressingKeyboardEvent(this.gos, event, params.node, params.column as AgColumn, true)) {
                params.onKeyDown(event);
            }
        };

        this.addManagedElementListeners(eGui, { keydown: listener });
    }
}

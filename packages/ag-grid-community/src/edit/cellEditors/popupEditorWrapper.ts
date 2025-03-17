import type { AgColumn } from '../../entities/agColumn';
import { _setDomData } from '../../gridOptionsUtils';
import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import type { ElementParams } from '../../utils/dom';
import { _isUserSuppressingKeyboardEvent } from '../../utils/keyboard';
import { PopupComponent } from '../../widgets/popupComponent';

const PopupEditorElement: ElementParams = { tag: 'div', cls: 'ag-popup-editor', attrs: { tabindex: '-1' } };
export class PopupEditorWrapper extends PopupComponent {
    constructor(private readonly params: ICellEditorParams) {
        super(PopupEditorElement);
    }

    public postConstruct(): void {
        _setDomData(this.gos, this.getGui(), 'popupEditorWrapper', true);
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

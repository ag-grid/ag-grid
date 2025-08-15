import { AgPopupComponent } from '../../agStack/popup/agPopupComponent';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { AgEventTypeParams } from '../../events';
import type { GridOptionsWithDefaults } from '../../gridOptionsDefault';
import type { GridOptionsService } from '../../gridOptionsService';
import { _setDomData } from '../../gridOptionsUtils';
import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import type { AgGridCommon } from '../../interfaces/iCommon';
import type { ElementParams } from '../../utils/element';
import { _isUserSuppressingKeyboardEvent } from '../../utils/keyboardEvent';
import type { AgComponentSelectorType } from '../../widgets/component';

const PopupEditorElement: ElementParams = { tag: 'div', cls: 'ag-popup-editor', attrs: { tabindex: '-1' } };
export class PopupEditorWrapper extends AgPopupComponent<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
> {
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

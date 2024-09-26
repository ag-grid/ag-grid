import { KeyCode } from '../../constants/keyCode';
import type { ICellEditorComp } from '../../interfaces/iCellEditor';
import { _exists } from '../../utils/generic';
import type { AgInputTextArea } from '../../widgets/agInputTextArea';
import { AgInputTextAreaSelector } from '../../widgets/agInputTextArea';
import { RefPlaceholder } from '../../widgets/component';
import { PopupComponent } from '../../widgets/popupComponent';
import type { ILargeTextEditorParams } from './iLargeTextCellEditor';

export class LargeTextCellEditor extends PopupComponent implements ICellEditorComp {
    private readonly eTextArea: AgInputTextArea = RefPlaceholder;
    private params: ILargeTextEditorParams;
    private focusAfterAttached: boolean;

    constructor() {
        super(
            /* html */ `<div class="ag-large-text">
        <ag-input-text-area data-ref="eTextArea" class="ag-large-text-input"></ag-input-text-area>
        </div>`,
            [AgInputTextAreaSelector]
        );
    }

    public init(params: ILargeTextEditorParams): void {
        this.params = params;
        this.focusAfterAttached = params.cellStartedEdit;

        this.eTextArea
            .setMaxLength(params.maxLength || 200)
            .setCols(params.cols || 60)
            .setRows(params.rows || 10);

        if (_exists(params.value, true)) {
            this.eTextArea.setValue(params.value.toString(), true);
        }

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        this.activateTabIndex();
    }

    private onKeyDown(event: KeyboardEvent): void {
        const key = event.key;

        if (
            key === KeyCode.LEFT ||
            key === KeyCode.UP ||
            key === KeyCode.RIGHT ||
            key === KeyCode.DOWN ||
            (event.shiftKey && key === KeyCode.ENTER)
        ) {
            // shift+enter allows for newlines
            event.stopPropagation();
        }
    }

    public afterGuiAttached(): void {
        const translate = this.localeService.getLocaleTextFunc();

        this.eTextArea.setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));

        if (this.focusAfterAttached) {
            this.eTextArea.getFocusableElement().focus();
        }
    }

    public getValue(): any {
        const value = this.eTextArea.getValue();
        if (!_exists(value) && !_exists(this.params.value)) {
            return this.params.value;
        }
        return this.params.parseValue(value!);
    }
}

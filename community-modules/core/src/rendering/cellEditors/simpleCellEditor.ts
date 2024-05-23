import { KeyCode } from '../../constants/keyCode';
import type { ICellEditorComp, ICellEditorParams } from '../../interfaces/iCellEditor';
import { _isBrowserSafari } from '../../utils/browser';
import type { AgInputTextField } from '../../widgets/agInputTextField';
import type { ComponentClass } from '../../widgets/component';
import { RefPlaceholder } from '../../widgets/component';
import { PopupComponent } from '../../widgets/popupComponent';

export interface CellEditorInput<TValue, P extends ICellEditorParams, I extends AgInputTextField> {
    getTemplate(): string;
    getAgComponents(): ComponentClass[];
    init(eInput: I, params: P): void;
    getValue(): TValue | null | undefined;
    getStartValue(): string | null | undefined;
    setCaret?(): void;
}

export class SimpleCellEditor<TValue, P extends ICellEditorParams, I extends AgInputTextField>
    extends PopupComponent
    implements ICellEditorComp
{
    private highlightAllOnFocus: boolean;
    private focusAfterAttached: boolean;
    protected params: ICellEditorParams;
    protected readonly eInput: I = RefPlaceholder;

    constructor(protected cellEditorInput: CellEditorInput<TValue, P, I>) {
        super(
            /* html */ `
            <div class="ag-cell-edit-wrapper">
                ${cellEditorInput.getTemplate()}
            </div>`,
            cellEditorInput.getAgComponents()
        );
    }

    public init(params: P): void {
        this.params = params;

        const eInput = this.eInput;
        this.cellEditorInput.init(eInput, params);
        let startValue: string | null | undefined;

        // cellStartedEdit is only false if we are doing fullRow editing
        if (params.cellStartedEdit) {
            this.focusAfterAttached = true;
            const eventKey = params.eventKey;

            if (eventKey === KeyCode.BACKSPACE || params.eventKey === KeyCode.DELETE) {
                startValue = '';
            } else if (eventKey && eventKey.length === 1) {
                startValue = eventKey;
            } else {
                startValue = this.cellEditorInput.getStartValue();

                if (eventKey !== KeyCode.F2) {
                    this.highlightAllOnFocus = true;
                }
            }
        } else {
            this.focusAfterAttached = false;
            startValue = this.cellEditorInput.getStartValue();
        }

        if (startValue != null) {
            eInput.setStartValue(startValue);
        }

        this.addManagedListener(eInput.getGui(), 'keydown', (event: KeyboardEvent) => {
            const { key } = event;

            if (key === KeyCode.PAGE_UP || key === KeyCode.PAGE_DOWN) {
                event.preventDefault();
            }
        });
    }

    public afterGuiAttached(): void {
        const translate = this.localeService.getLocaleTextFunc();
        const eInput = this.eInput;

        eInput.setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));

        if (!this.focusAfterAttached) {
            return;
        }
        // Added for AG-3238. We can't remove this explicit focus() because Chrome requires an input
        // to be focused before setSelectionRange will work. But it triggers a bug in Safari where
        // explicitly focusing then blurring an empty field will cause the parent container to scroll.
        if (!_isBrowserSafari()) {
            eInput.getFocusableElement().focus();
        }

        const inputEl = eInput.getInputElement();

        if (this.highlightAllOnFocus) {
            inputEl.select();
        } else {
            this.cellEditorInput.setCaret?.();
        }
    }

    // gets called when tabbing through cells and in full row edit mode
    public focusIn(): void {
        const eInput = this.eInput;
        const focusEl = eInput.getFocusableElement();
        const inputEl = eInput.getInputElement();

        focusEl.focus();
        inputEl.select();
    }

    public getValue(): TValue | null | undefined {
        return this.cellEditorInput.getValue();
    }

    public isPopup() {
        return false;
    }
}

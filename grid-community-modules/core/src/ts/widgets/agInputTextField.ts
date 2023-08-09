import { AgAbstractInputField, IInputField } from './agAbstractInputField';
import { exists } from '../utils/generic';
import { isEventFromPrintableCharacter } from '../utils/keyboard';

export interface ITextInputField extends IInputField {
    allowedCharPattern?: string;
}

export class AgInputTextField extends AgAbstractInputField<HTMLInputElement, string, ITextInputField> {
    constructor(config?: ITextInputField, className = 'ag-text-field', inputType = 'text') {
        super(config, className, inputType);
    }

    protected postConstruct() {
        super.postConstruct();

        if (this.config.allowedCharPattern) {
            this.preventDisallowedCharacters();
        }
    }

    public setValue(value?: string | null, silent?: boolean): this {
        // update the input before we call super.setValue, so it's updated before the value changed event is fired
        if (this.eInput.value !== value) {
            this.eInput.value = exists(value) ? value : '';
        }

        return super.setValue(value, silent);
    }

    /** Used to set an initial value into the input without necessarily setting `this.value` or triggering events (e.g. to set an invalid value) */
    public setStartValue(value?: string | null): void {
        this.setValue(value, true);
    }

    private preventDisallowedCharacters(): void {
        const pattern = new RegExp(`[${this.config.allowedCharPattern}]`);

        const preventCharacters = (event: KeyboardEvent) => {
            if (!isEventFromPrintableCharacter(event)) { return; }

            if (event.key && !pattern.test(event.key)) {
                event.preventDefault();
            }
        };

        this.addManagedListener(this.eInput, 'keydown', preventCharacters);

        this.addManagedListener(this.eInput, 'paste', (e: ClipboardEvent) => {
            const text = e.clipboardData?.getData('text');

            if (text && text.split('').some((c: string) => !pattern.test(c))) {
                e.preventDefault();
            }
        });
    }
}

import { AgAbstractInputField, IInputField } from './agAbstractInputField';
import { exists } from '../utils/generic';

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
        const ret = super.setValue(value, silent);

        if (this.eInput.value !== value) {
            this.eInput.value = exists(value) ? value : '';
        }

        return ret;
    }

    private preventDisallowedCharacters(): void {
        const pattern = new RegExp(`[${this.config.allowedCharPattern}]`);

        const preventDisallowedCharacters = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey) {
                // copy/paste can fall in here on certain browsers (e.g. Safari)
                return;
            }
            if (event.key && !pattern.test(event.key)) {
                event.preventDefault();
            }
        };

        this.addManagedListener(this.eInput, 'keypress', preventDisallowedCharacters);

        this.addManagedListener(this.eInput, 'paste', (e: ClipboardEvent) => {
            const text = e.clipboardData?.getData('text');

            if (text && text.split('').some((c: string) => !pattern.test(c))) {
                e.preventDefault();
            }
        });
    }
}

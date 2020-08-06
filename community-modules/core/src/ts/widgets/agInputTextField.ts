import { AgAbstractInputField, IInputField } from './agAbstractInputField';
import { some } from '../utils/array';
import { exists } from '../utils/generic';

export interface ITextInputField extends IInputField {
    allowedCharPattern?: string;
}

export class AgInputTextField extends AgAbstractInputField<HTMLInputElement, string, ITextInputField> {
    constructor(className = 'ag-text-field', inputType = 'text', config?: ITextInputField) {
        super(className, 'input', inputType, config);
    }

    protected postConstruct() {
        super.postConstruct();

        if (this.config.allowedCharPattern) {
            this.preventDisallowedCharacters();
        }
    }

    public setValue(value: string, silent?: boolean): this {
        const ret = super.setValue(value, silent);

        if (this.eInput.value !== value) {
            this.eInput.value = exists(value) ? value : '';
        }

        return ret;
    }

    private preventDisallowedCharacters(): void {
        const pattern = new RegExp(`[${this.config.allowedCharPattern}]`);

        const preventDisallowedCharacters = (event: KeyboardEvent) => {
            if (event.key && !pattern.test(event.key)) {
                event.preventDefault();
            }
        };

        this.addManagedListener(this.eInput, 'keypress', preventDisallowedCharacters);

        this.addManagedListener(this.eInput, 'paste', e => {
            const text = (e.clipboardData || e.clipboardData).getData('text');

            if (some(text, (c: string) => !pattern.test(c))) {
                e.preventDefault();
            }
        });
    }
}

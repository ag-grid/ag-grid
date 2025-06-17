import type { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';

export class PhoneEditor implements ICellEditorComp<string> {
    private eInput!: HTMLInputElement;
    private value: string = '';
    private params!: ICellEditorParams<any, string>;
    private validationError: string | null = null;

    public init(params: ICellEditorParams<any, string>): void {
        this.params = params;
        this.value = params.value || '';

        this.eInput = document.createElement('input');
        this.eInput.type = 'text';
        this.eInput.value = this.value;
        this.eInput.placeholder = '(123) 456-7890';
        this.eInput.classList.add('phone-cell-editor');

        this.eInput.addEventListener('input', () => {
            this.validatePhone();
        });

        this.eInput.addEventListener('blur', () => {
            this.validatePhone();
        });
    }

    public getGui(): HTMLElement {
        return this.eInput;
    }

    public afterGuiAttached(): void {
        this.eInput.focus();
        this.eInput.select();
    }

    public getValue(): string {
        return this.eInput.value;
    }

    public isCancelAfterEnd(): boolean {
        return false;
    }

    // Optional validation helper for AG Grid
    public getValidationErrors(): string[] | null {
        return this.validationError ? [this.validationError] : null;
    }

    public getValidationElement(): HTMLElement {
        return this.eInput;
    }

    private validatePhone(): void {
        const val = this.eInput.value.trim();
        const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;

        if (!phoneRegex.test(val)) {
            this.validationError = 'Invalid phone format. Use (123) 456-7890';
        } else {
            this.validationError = null;
        }

        this.params.validate?.();
    }
}

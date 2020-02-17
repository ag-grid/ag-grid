import { Autowired } from '../context/context';
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { AgEvent } from '../events';
import { AgAbstractInputField } from './agAbstractInputField';
import { LabelAlignment } from './agAbstractLabel';
import { _ } from '../utils';

export interface ChangeEvent extends AgEvent {
    selected: boolean;
}

export class AgCheckbox extends AgAbstractInputField<HTMLInputElement, boolean> {
    protected className = 'ag-checkbox';
    protected displayTag = 'input';
    protected inputType = 'checkbox';
    protected labelAlignment: LabelAlignment = 'right';

    @Autowired('gridOptionsWrapper') protected gridOptionsWrapper: GridOptionsWrapper;

    private selected: boolean | undefined = false;
    private readOnly = false;
    private passive = false;

    constructor() {
        super();
        this.setTemplate(this.TEMPLATE.replace(/%displayField%/g, this.displayTag));
    }

    protected addInputListeners() {
        this.addDestroyableEventListener(this.eInput, 'click', this.onCheckboxClick.bind(this));
    }

    public getNextValue(): boolean {
        return this.selected === undefined ? true : !this.selected;
    }

    public setPassive(passive: boolean): void {
        this.passive = passive;
    }

    public isReadOnly(): boolean {
        return this.readOnly;
    }

    public setReadOnly(readOnly: boolean): void {
        this.eInput.disabled = readOnly;
        this.readOnly = readOnly;
    }

    public toggle(): void {
        const nextValue = this.getNextValue();

        if (this.passive) {
            this.dispatchChange(nextValue);
        } else {
            this.setValue(nextValue);
        }
    }

    public getValue(): boolean {
        return this.isSelected();
    }

    public setValue(value: boolean | undefined, silent?: boolean): this {
        if (value === this.getValue()) { return; }

        this.setSelected(value, silent);
        return this;
    }

    protected isSelected(): boolean {
        return this.selected;
    }

    protected setSelected(selected?: boolean, silent?: boolean): void {
        if (this.selected === selected) {
            return;
        }

        this.selected = typeof selected === 'boolean' ? selected : undefined;
        (this.eInput as HTMLInputElement).checked = this.selected;
        (this.eInput as HTMLInputElement).indeterminate = this.selected === undefined;

        if (!silent) {
            this.dispatchChange(this.selected);
        }
    }

    private dispatchChange(selected: boolean | undefined, event?: MouseEvent) {
        this.dispatchEvent({ type: AgCheckbox.EVENT_CHANGED, selected, event });
    }

    private onCheckboxClick(e: MouseEvent) {
        this.selected = (e.target as HTMLInputElement).checked;
        this.dispatchChange(this.selected, e);
    }
}

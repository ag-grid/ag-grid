import { Events, CheckboxChangedEvent } from "../events";
import { AgAbstractInputField, IInputField } from './agAbstractInputField';
import { LabelAlignment } from './agAbstractLabel';

export class AgCheckbox extends AgAbstractInputField<HTMLInputElement, boolean> {

    protected labelAlignment: LabelAlignment = 'right';

    private selected?: boolean = false;
    private readOnly = false;
    private passive = false;

    constructor(config?: IInputField, className = 'ag-checkbox', inputType = 'checkbox') {
        super(config, className, inputType);
    }

    protected addInputListeners() {
        this.addManagedListener(this.eInput, 'click', this.onCheckboxClick.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.toggle.bind(this));
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
        this.eWrapper.classList.toggle('ag-disabled', readOnly);
        this.eInput.disabled = readOnly;
        this.readOnly = readOnly;
    }

    public setDisabled(disabled: boolean): this {
        this.eWrapper.classList.toggle('ag-disabled', disabled);

        return super.setDisabled(disabled);
    }

    public toggle(): void {
        if (this.eInput.disabled) { return; }

        const previousValue = this.isSelected();
        const nextValue = this.getNextValue();

        if (this.passive) {
            this.dispatchChange(nextValue, previousValue);
        } else {
            this.setValue(nextValue);
        }
    }

    public getValue(): boolean | undefined {
        return this.isSelected();
    }

    public setValue(value?: boolean, silent?: boolean): this {
        this.refreshSelectedClass(value);
        this.setSelected(value, silent);

        return this;
    }

    public setName(name: string): this {
        const input = this.getInputElement();
        input.name = name;

        return this;
    }

    protected isSelected(): boolean | undefined {
        return this.selected;
    }

    private setSelected(selected?: boolean, silent?: boolean): void {
        if (this.isSelected() === selected) {
            return;
        }

        this.previousValue = this.isSelected();

        selected = this.selected = typeof selected === 'boolean' ? selected : undefined;
        this.eInput.checked = selected!;
        this.eInput.indeterminate = selected === undefined;

        if (!silent) {
            this.dispatchChange(this.selected, this.previousValue);
        }
    }

    private dispatchChange(selected: boolean | undefined, previousValue: boolean | undefined, event?: MouseEvent) {
        this.dispatchEvent({ type: AgCheckbox.EVENT_CHANGED, selected, previousValue, event });

        const input = this.getInputElement();
        const checkboxChangedEvent: CheckboxChangedEvent = {
            type: Events.EVENT_CHECKBOX_CHANGED,
            id: input.id,
            name: input.name,
            selected,
            previousValue
        };

        this.eventService.dispatchEvent(checkboxChangedEvent);
    }

    private onCheckboxClick(e: MouseEvent) {
        if (this.passive || this.eInput.disabled) { return; }
        const previousValue = this.isSelected();
        const selected = this.selected = (e.target as HTMLInputElement).checked;
        this.refreshSelectedClass(selected);
        this.dispatchChange(selected, previousValue, e);
    }

    private refreshSelectedClass(value?: boolean | null) {
        this.eWrapper.classList.toggle('ag-checked', value === true);
        this.eWrapper.classList.toggle('ag-indeterminate', value == null);
    }

}

import { Autowired } from '../context/context';
import { Events, CheckboxChangedEvent } from "../events";
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { AgEvent } from '../events';
import { AgAbstractInputField } from './agAbstractInputField';
import { LabelAlignment } from './agAbstractLabel';
import { addOrRemoveCssClass } from '../utils/dom';

export interface ChangeEvent extends AgEvent {
    selected: boolean;
}

export class AgCheckbox extends AgAbstractInputField<HTMLInputElement, boolean> {
    @Autowired('gridOptionsWrapper') protected readonly gridOptionsWrapper: GridOptionsWrapper;

    protected labelAlignment: LabelAlignment = 'right';

    private selected?: boolean = false;
    private readOnly = false;
    private passive = false;

    constructor(className = 'ag-checkbox', inputType = 'checkbox') {
        super(className, 'input', inputType);
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
        addOrRemoveCssClass(this.eWrapper, 'ag-disabled', readOnly);
        this.eInput.disabled = readOnly;
        this.readOnly = readOnly;
    }

    public setDisabled(disabled: boolean): this {
        addOrRemoveCssClass(this.eWrapper, 'ag-disabled', disabled);

        return super.setDisabled(disabled);
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

    public setValue(value?: boolean, silent?: boolean): this {
        this.refreshSelectedClass(value);
        this.setSelected(value, silent);

        return this;
    }

    public setName(name: string): this {
        const input = this.getInputElement() as HTMLInputElement;
        input.name = name;

        return this;
    }

    protected isSelected(): boolean {
        return this.selected;
    }

    private setSelected(selected?: boolean, silent?: boolean): void {
        if (this.isSelected() === selected) {
            return;
        }

        this.selected = typeof selected === 'boolean' ? selected : undefined;
        (this.eInput as HTMLInputElement).checked = this.selected;
        (this.eInput as HTMLInputElement).indeterminate = this.selected === undefined;

        if (!silent) {
            this.dispatchChange(this.selected);
        }
    }

    protected dispatchChange(selected?: boolean, event?: MouseEvent) {
        this.dispatchEvent({ type: AgCheckbox.EVENT_CHANGED, selected, event });

        const input = this.getInputElement() as HTMLInputElement;
        const checkboxChangedEvent: CheckboxChangedEvent = {
            type: Events.EVENT_CHECKBOX_CHANGED,
            id: input.id,
            name: input.name,
            selected
        };

        this.eventService.dispatchEvent(checkboxChangedEvent);
    }

    private onCheckboxClick(e: MouseEvent) {
        this.selected = (e.target as HTMLInputElement).checked;
        this.refreshSelectedClass(this.selected);
        this.dispatchChange(this.selected, e);
    }

    private refreshSelectedClass(value?: boolean | null) {
        addOrRemoveCssClass(this.eWrapper, 'ag-checked', value === true);
        addOrRemoveCssClass(this.eWrapper, 'ag-indeterminate', value == null);
    }
}

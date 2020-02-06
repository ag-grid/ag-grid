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

    private dispatchChange(selected: boolean | undefined) {
        this.dispatchEvent({ type: AgCheckbox.EVENT_CHANGED, selected });
    }

    private onClick(event: MouseEvent): void {
        // if we don't set the path, then won't work in Edge, as once the <span> is removed from the dom,
        // it's not possible to calculate the path by following the parent's chain. in other browser (eg
        // chrome) there is event.path for this purpose, but missing in Edge.
        _.addAgGridEventPath(event);

        if (!this.readOnly) {
            this.toggle();
        }
    }

    private onCheckboxClick(e: MouseEvent) {
        this.selected = (e.target as HTMLInputElement).checked;
        this.dispatchChange(this.selected);
        const input = this.eInput;
        setTimeout(() => {
            _.addCssClass(input, 'ag-input-click-animation');
            setTimeout(() => _.removeCssClass(input, 'ag-input-click-animation'), 500);
        }, 50);
    }
}

import { KeyCode } from '../constants/keyCode';
import { Events } from '../eventKeys';
import { AgPickerFieldParams } from '../interfaces/agFieldParams';
import { _setAriaControls } from '../utils/aria';
import { AgList, ListOption } from './agList';
import { AgPickerField } from './agPickerField';
import { AgComponentSelector } from './component';

export interface AgSelectParams<TValue = string>
    extends Omit<AgPickerFieldParams, 'pickerType' | 'pickerAriaLabelKey' | 'pickerAriaLabelValue'> {
    options?: ListOption<TValue>[];
    pickerType?: string;
    pickerAriaLabelKey?: string;
    pickerAriaLabelValue?: string;
    placeholder?: string;
}

export class AgSelect<TValue = string | null> extends AgPickerField<
    TValue,
    AgSelectParams<TValue> & AgPickerFieldParams,
    AgList<TValue>
> {
    static readonly selector: AgComponentSelector = 'ag-select';

    public static EVENT_ITEM_SELECTED = 'selectedItem';
    protected listComponent: AgList<TValue> | undefined;

    constructor(config?: AgSelectParams<TValue>) {
        super({
            pickerAriaLabelKey: 'ariaLabelSelectField',
            pickerAriaLabelValue: 'Select Field',
            pickerType: 'ag-list',
            className: 'ag-select',
            pickerIcon: 'smallDown',
            ariaRole: 'combobox',
            ...config,
        });
    }

    protected postConstruct(): void {
        super.postConstruct();
        this.createListComponent();
        this.eWrapper.tabIndex = this.gos.get('tabIndex');

        const { options, value, placeholder } = this.config;
        if (options != null) {
            this.addOptions(options);
        }
        if (value != null) {
            // need to reapply value after list component created
            this.setValue(value, true);
        }
        if (placeholder && value == null) {
            this.eDisplayField.textContent = placeholder;
        }

        this.addManagedListener(this.eWrapper, 'focusout', this.onWrapperFocusOut.bind(this));
    }

    private onWrapperFocusOut(e: FocusEvent): void {
        if (!this.eWrapper.contains(e.relatedTarget as Element)) {
            this.hidePicker();
        }
    }

    private createListComponent(): void {
        this.listComponent = this.createBean(new AgList('select', true));
        this.listComponent.setParentComponent(this);

        const eListAriaEl = this.listComponent.getAriaElement();
        const listId = `ag-select-list-${this.listComponent.getCompId()}`;

        eListAriaEl.setAttribute('id', listId);
        _setAriaControls(this.getAriaElement(), eListAriaEl);

        this.listComponent.addManagedListener(this.listComponent, AgList.EVENT_ITEM_SELECTED, () => {
            this.hidePicker();
            this.dispatchEvent({ type: AgSelect.EVENT_ITEM_SELECTED });
        });

        this.listComponent.addManagedListener(this.listComponent, Events.EVENT_FIELD_VALUE_CHANGED, () => {
            if (!this.listComponent) {
                return;
            }
            this.setValue(this.listComponent.getValue()!, false, true);
            this.hidePicker();
        });
    }

    protected createPickerComponent() {
        // do not create the picker every time to save state
        return this.listComponent!;
    }

    protected onKeyDown(e: KeyboardEvent): void {
        const { key } = e;

        if (key === KeyCode.TAB) {
            this.hidePicker();
        }

        switch (key) {
            case KeyCode.ENTER:
            case KeyCode.UP:
            case KeyCode.DOWN:
            case KeyCode.PAGE_UP:
            case KeyCode.PAGE_DOWN:
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                e.preventDefault();
                if (this.isPickerDisplayed) {
                    this.listComponent?.handleKeyDown(e);
                } else {
                    super.onKeyDown(e);
                }
                break;
            case KeyCode.ESCAPE:
                super.onKeyDown(e);
                break;
        }
    }

    public showPicker() {
        if (!this.listComponent) {
            return;
        }

        super.showPicker();

        this.listComponent.refreshHighlighted();
    }

    public addOptions(options: ListOption<TValue>[]): this {
        options.forEach((option) => this.addOption(option));

        return this;
    }

    public addOption(option: ListOption<TValue>): this {
        this.listComponent!.addOption(option);

        return this;
    }

    public clearOptions(): this {
        this.listComponent?.clearOptions();

        return this;
    }

    public setValue(value?: TValue, silent?: boolean, fromPicker?: boolean): this {
        if (this.value === value || !this.listComponent) {
            return this;
        }

        if (!fromPicker) {
            this.listComponent.setValue(value, true);
        }

        const newValue = this.listComponent.getValue();

        if (newValue === this.getValue()) {
            return this;
        }

        let displayValue = this.listComponent.getDisplayValue();
        if (displayValue == null && this.config.placeholder) {
            displayValue = this.config.placeholder;
        }

        this.eDisplayField.textContent = displayValue!;

        this.setTooltip({
            newTooltipText: displayValue ?? null,
            shouldDisplayTooltip: () => this.eDisplayField.scrollWidth > this.eDisplayField.clientWidth,
        });

        return super.setValue(value, silent);
    }

    protected destroy(): void {
        if (this.listComponent) {
            this.destroyBean(this.listComponent);
            this.listComponent = undefined;
        }

        super.destroy();
    }
}

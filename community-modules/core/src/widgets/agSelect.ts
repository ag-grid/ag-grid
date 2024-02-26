import { AgPickerField, AgPickerFieldParams } from "./agPickerField";
import { ListOption, AgList } from "./agList";
import { Events } from "../eventKeys";
import { KeyCode } from "../constants/keyCode";
import { setAriaControls } from "../utils/aria";

export interface AgSelectParams extends Omit<AgPickerFieldParams, 'pickerType' | 'pickerAriaLabelKey' | 'pickerAriaLabelValue'> {
    options?: ListOption[];
    pickerType?: string;
    pickerAriaLabelKey?: string;
    pickerAriaLabelValue?: string;
}

export class AgSelect extends AgPickerField<string | null, AgSelectParams & AgPickerFieldParams, AgList> {
    public static EVENT_ITEM_SELECTED = 'selectedItem';
    protected listComponent: AgList | undefined;

    constructor(config?: AgSelectParams) {
        super({
            pickerAriaLabelKey: 'ariaLabelSelectField',
            pickerAriaLabelValue: 'Select Field',
            pickerType: 'ag-list',
            className: 'ag-select',
            pickerIcon: 'smallDown',
            ariaRole: 'combobox',
            ...config
        });
    }

    protected postConstruct(): void {
        super.postConstruct();
        this.createListComponent();
        this.eWrapper.tabIndex = this.gridOptionsService.get('tabIndex');

        const { options, value } = this.config;
        if (options != null) {
            this.addOptions(options);
        }
        if (value != null) {
            // need to reapply value after list component created
            this.setValue(value, true);
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
        setAriaControls(this.getAriaElement(), eListAriaEl);

        this.listComponent.addManagedListener(
            this.listComponent,
            AgList.EVENT_ITEM_SELECTED,
            () => {
                this.hidePicker();
                this.dispatchEvent({ type: AgSelect.EVENT_ITEM_SELECTED });
            }
        );

        this.listComponent.addManagedListener(
            this.listComponent,
            Events.EVENT_FIELD_VALUE_CHANGED,
            () => {
                if (!this.listComponent) { return; }
                this.setValue(this.listComponent.getValue()!, false, true);
                this.hidePicker();
            }
        );
    }

    protected createPickerComponent() {
        // do not create the picker every time to save state
        return this.listComponent!;
    }

    protected onKeyDown(e: KeyboardEvent): void {
        const { key } = e;
        if (key === KeyCode.TAB) {
            this.hidePicker();
        } else if (!this.isPickerDisplayed || (key !== KeyCode.ENTER && key !== KeyCode.UP && key !== KeyCode.DOWN)) {
            super.onKeyDown(e);
        } else {
            this.listComponent?.handleKeyDown(e);
        }
    }

    public showPicker() {
        if (!this.listComponent) { return; }

        super.showPicker();

        this.listComponent.refreshHighlighted();
    }

    public addOptions(options: ListOption[]): this {
        options.forEach(option => this.addOption(option));

        return this;
    }

    public addOption(option: ListOption): this {
        this.listComponent!.addOption(option);

        return this;
    }

    public setValue(value?: string | null , silent?: boolean, fromPicker?: boolean): this {
        if (this.value === value || !this.listComponent) { return this; }

        if (!fromPicker) {
            this.listComponent.setValue(value, true);
        }

        const newValue = this.listComponent.getValue();

        if (newValue === this.getValue()) { return this; }

        this.eDisplayField.innerHTML = this.listComponent.getDisplayValue()!;

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

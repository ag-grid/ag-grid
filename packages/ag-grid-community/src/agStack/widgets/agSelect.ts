import { KeyCode } from '../constants/keyCode';
import type { AgComponentSelector } from '../interfaces/agComponent';
import type { AgCoreBean } from '../interfaces/agCoreBean';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import type { ITooltipFeature, TooltipCtrl } from '../interfaces/iTooltip';
import { _setAriaControlsAndLabel } from '../utils/aria';
import { _isElementOverflowingCallback } from '../utils/dom';
import type { ListOption } from './agList';
import { AgList } from './agList';
import { AgPickerField } from './agPickerField';
import type { AgPickerFieldParams } from './agPickerFieldParams';
import { agSelectCSS } from './agSelect.css-GENERATED';
import type { AgWidgetSelectorType } from './agWidgetSelectorType';

export interface AgSelectParams<TComponentSelectorType extends string, TValue = string>
    extends Omit<
        AgPickerFieldParams<TComponentSelectorType>,
        'pickerType' | 'pickerAriaLabelKey' | 'pickerAriaLabelValue'
    > {
    options?: ListOption<TValue>[];
    pickerType?: string;
    pickerAriaLabelKey?: string;
    pickerAriaLabelValue?: string;
    placeholder?: string;
}
type AgSelectEvent = 'selectedItem';
export class AgSelect<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TValue = string | null,
> extends AgPickerField<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    TValue,
    AgSelectParams<TComponentSelectorType, TValue> & AgPickerFieldParams<TComponentSelectorType>,
    AgSelectEvent,
    AgList<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType,
        AgSelectEvent,
        TValue
    >
> {
    protected listComponent:
        | AgList<
              TBeanCollection,
              TProperties,
              TGlobalEvents,
              TCommon,
              TPropertiesService,
              TComponentSelectorType,
              AgSelectEvent,
              TValue
          >
        | undefined;
    private tooltipFeature?: ITooltipFeature;

    constructor(config?: AgSelectParams<TComponentSelectorType, TValue>) {
        super({
            pickerAriaLabelKey: 'ariaLabelSelectField',
            pickerAriaLabelValue: 'Select Field',
            pickerType: 'ag-list',
            className: 'ag-select',
            pickerIcon: 'selectOpen',
            ariaRole: 'combobox',
            ...config,
        });
        this.registerCSS(agSelectCSS);
    }

    public override postConstruct(): void {
        this.tooltipFeature = this.createOptionalManagedBean(
            this.beans.registry.createDynamicBean<ITooltipFeature & AgCoreBean<TBeanCollection>>(
                'tooltipFeature',
                false,
                {
                    shouldDisplayTooltip: _isElementOverflowingCallback(() => this.eDisplayField),
                    getGui: () => this.getGui(),
                } as TooltipCtrl<string, any>
            )
        );
        super.postConstruct();
        this.createListComponent();
        this.eWrapper.tabIndex = this.gos.get('tabIndex')!;

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

        this.addManagedElementListeners(this.eWrapper, { focusout: this.onWrapperFocusOut.bind(this) });
    }

    private onWrapperFocusOut(e: FocusEvent): void {
        if (!this.eWrapper.contains(e.relatedTarget as Element)) {
            this.hidePicker();
        }
    }

    private createListComponent(): void {
        const listComponent = this.createBean(
            new AgList<
                TBeanCollection,
                TProperties,
                TGlobalEvents,
                TCommon,
                TPropertiesService,
                TComponentSelectorType,
                AgSelectEvent,
                TValue
            >('select')
        );
        this.listComponent = listComponent;
        listComponent.setParentComponent(this);

        const eListAriaEl = listComponent.getAriaElement();
        const listId = `ag-select-list-${listComponent.getCompId()}`;

        eListAriaEl.setAttribute('id', listId);
        _setAriaControlsAndLabel(this.getAriaElement(), eListAriaEl);

        listComponent.addManagedElementListeners(listComponent.getGui(), {
            mousedown: (e) => {
                e?.preventDefault();
            },
        });

        listComponent.addManagedListeners(listComponent, {
            selectedItem: () => {
                this.hidePicker();
                this.dispatchLocalEvent({ type: 'selectedItem' });
            },
            fieldValueChanged: () => {
                if (!this.listComponent) {
                    return;
                }
                this.setValue(this.listComponent.getValue()!, false, true);
                this.hidePicker();
            },
        });
    }

    protected createPickerComponent() {
        // do not create the picker every time to save state
        return this.listComponent!;
    }

    protected override beforeHidePicker(): void {
        this.listComponent?.hideItemTooltip();
        super.beforeHidePicker();
    }

    protected override onKeyDown(e: KeyboardEvent): void {
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
            case KeyCode.SPACE:
                if (this.isPickerDisplayed) {
                    e.preventDefault();
                } else {
                    super.onKeyDown(e);
                }
                break;
        }
    }

    public override showPicker() {
        const listComponent = this.listComponent;
        if (!listComponent) {
            return;
        }

        super.showPicker();

        listComponent.refreshHighlighted();
    }

    public addOptions(options: ListOption<TValue>[]): this {
        for (const option of options) {
            this.addOption(option);
        }

        return this;
    }

    public addOption(option: ListOption<TValue>): this {
        this.listComponent!.addOption(option);

        return this;
    }

    public clearOptions(): this {
        this.listComponent?.clearOptions();
        this.setValue(undefined, true);
        return this;
    }

    public updateOptions(options: ListOption<TValue>[]): this {
        if (this.listComponent?.updateOptions(options)) {
            this.setValue(undefined, true);
        }
        return this;
    }

    public override setValue(value?: TValue, silent?: boolean, fromPicker?: boolean): this {
        const {
            listComponent,
            config: { placeholder },
            eDisplayField,
            tooltipFeature,
        } = this;
        if (this.value === value || !listComponent) {
            return this;
        }

        if (!fromPicker) {
            listComponent.setValue(value, true);
        }

        const newValue = listComponent.getValue();

        if (newValue === this.getValue()) {
            return this;
        }

        let displayValue = listComponent.getDisplayValue();
        if (displayValue == null && placeholder) {
            displayValue = placeholder;
        }

        eDisplayField.textContent = displayValue!;

        tooltipFeature?.setTooltipAndRefresh(displayValue ?? null);

        return super.setValue(value, silent);
    }

    public override destroy(): void {
        this.listComponent = this.destroyBean(this.listComponent);

        super.destroy();
    }
}

export const AgSelectSelector: AgComponentSelector<AgWidgetSelectorType> = {
    selector: 'AG-SELECT',
    component: AgSelect,
};

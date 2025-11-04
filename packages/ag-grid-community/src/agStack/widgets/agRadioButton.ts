import type { AgComponentSelector } from '../interfaces/agComponent';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { AgCheckboxChangedEvent, BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { AgCheckbox } from './agCheckbox';
import type { AgCheckboxParams } from './agFieldParams';
import type { AgWidgetSelectorType } from './agWidgetSelectorType';

export interface AgRadioButtonParams<TComponentSelectorType extends string>
    extends AgCheckboxParams<TComponentSelectorType> {}

export class AgRadioButton<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
> extends AgCheckbox<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    AgRadioButtonParams<TComponentSelectorType>
> {
    constructor(config?: AgRadioButtonParams<TComponentSelectorType>) {
        super(config, 'ag-radio-button', 'radio');
    }

    protected override isSelected(): boolean {
        return this.eInput.checked;
    }

    public override toggle(): void {
        if (this.eInput.disabled) {
            return;
        }

        // do not allow an active radio button to be deselected
        if (!this.isSelected()) {
            this.setValue(true);
        }
    }

    protected override addInputListeners() {
        super.addInputListeners();

        this.addManagedEventListeners({ checkboxChanged: this.onChange.bind(this) });
    }

    /**
     * This ensures that if another radio button in the same named group is selected, we deselect this radio button.
     * By default the browser does this for you, but we are managing classes ourselves in order to ensure input
     * elements are styled correctly in IE11, and the DOM 'changed' event is only fired when a button is selected,
     * not deselected, so we need to use our own event.
     */
    private onChange(event: AgCheckboxChangedEvent) {
        const eInput = this.eInput;
        if (
            event.selected &&
            event.name &&
            eInput.name &&
            eInput.name === event.name &&
            event.id &&
            eInput.id !== event.id
        ) {
            this.setValue(false, true);
        }
    }
}

export const AgRadioButtonSelector: AgComponentSelector<AgWidgetSelectorType> = {
    selector: 'AG-RADIO-BUTTON',
    component: AgRadioButton,
};

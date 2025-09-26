import type { AgComponentSelector } from '../interfaces/agComponent';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { AgCheckbox } from './agCheckbox';
import type { AgCheckboxParams } from './agFieldParams';
import { agToggleButtonCSS } from './agToggleButton.css-GENERATED';
import type { AgWidgetSelectorType } from './agWidgetSelectorType';

export interface AgToggleButtonParams<TComponentSelectorType extends string>
    extends AgCheckboxParams<TComponentSelectorType> {}

export class AgToggleButton<
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
    AgToggleButtonParams<TComponentSelectorType>
> {
    constructor(config?: AgToggleButtonParams<TComponentSelectorType>) {
        super(config, 'ag-toggle-button');
        this.registerCSS(agToggleButtonCSS);
    }

    public override setValue(value: boolean, silent?: boolean): this {
        super.setValue(value, silent);

        this.toggleCss('ag-selected', this.getValue()!);

        return this;
    }
}
export const AgToggleButtonSelector: AgComponentSelector<AgWidgetSelectorType> = {
    selector: 'AG-TOGGLE-BUTTON',
    component: AgToggleButton,
};

import type {
    AgComponentSelector,
    AgCoreBeanCollection,
    BaseEvents,
    BaseProperties,
    IPropertiesService,
} from 'ag-stack';

import { AgCheckbox } from './agCheckbox';
import type { AgCheckboxParams } from './agFieldParams';
import agToggleButtonCSS from './agToggleButton.css';
import type { AgWidgetSelectorType } from './agWidgetSelectorType';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgToggleButtonParams<
    TComponentSelectorType extends string,
> extends AgCheckboxParams<TComponentSelectorType> {}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const AgToggleButtonSelector: AgComponentSelector<AgWidgetSelectorType> = {
    selector: 'AG-TOGGLE-BUTTON',
    component: AgToggleButton,
};

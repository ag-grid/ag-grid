import type { AgComponentSelector } from '../agStack/interfaces/iComponent';
import type { AgCoreBeanCollection } from '../agStack/interfaces/iContext';
import type { BaseEvents } from '../agStack/interfaces/iEvent';
import type { BaseProperties, IPropertiesService } from '../agStack/interfaces/iProperties';
import type { AgCheckboxParams } from '../interfaces/agFieldParams';
import { AgCheckbox } from './agCheckbox';
import { agToggleButtonCSS } from './agToggleButton.css-GENERATED';
import type { AgComponentSelectorType } from './component';

export interface AgToggleButtonParams<TComponentSelectorType extends string>
    extends AgCheckboxParams<TComponentSelectorType> {}

export class AgToggleButton<
    TBeanCollection extends AgCoreBeanCollection<TBeanCollection, TPropertiesService, TGlobalEvents, TCommon>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties>,
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
export const AgToggleButtonSelector: AgComponentSelector<AgComponentSelectorType> = {
    selector: 'AG-TOGGLE-BUTTON',
    component: AgToggleButton,
};

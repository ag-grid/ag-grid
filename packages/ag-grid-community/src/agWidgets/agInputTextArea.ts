import type {
    AgComponentSelector,
    AgCoreBeanCollection,
    BaseEvents,
    BaseProperties,
    IPropertiesService,
} from 'ag-stack';

import { AgAbstractInputField } from './agAbstractInputField';
import type { AgInputFieldParams } from './agFieldParams';
import type { AgWidgetSelectorType } from './agWidgetSelectorType';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgInputTextArea<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
> extends AgAbstractInputField<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    HTMLTextAreaElement,
    string
> {
    constructor(config?: AgInputFieldParams<TComponentSelectorType>) {
        super(config, 'ag-text-area', null, 'textarea');
    }

    public override setValue(value: string, silent?: boolean): this {
        const ret = super.setValue(value, silent);

        this.eInput.value = value;

        return ret;
    }

    public setCols(cols: number): this {
        this.eInput.cols = cols;

        return this;
    }

    public setRows(rows: number): this {
        this.eInput.rows = rows;

        return this;
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const AgInputTextAreaSelector: AgComponentSelector<AgWidgetSelectorType> = {
    selector: 'AG-INPUT-TEXT-AREA',
    component: AgInputTextArea,
};

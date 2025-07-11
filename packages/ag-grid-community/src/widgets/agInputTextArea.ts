import type { AgComponentSelector } from '../agStack/interfaces/iComponent';
import type { AgCoreBeanCollection } from '../agStack/interfaces/iContext';
import type { BaseEvents } from '../agStack/interfaces/iEvent';
import type { BaseProperties, IPropertiesService } from '../agStack/interfaces/iProperties';
import type { AgInputFieldParams } from '../interfaces/agFieldParams';
import { AgAbstractInputField } from './agAbstractInputField';
import type { AgComponentSelectorType } from './component';

export class AgInputTextArea<
    TBeanCollection extends AgCoreBeanCollection<TBeanCollection, TPropertiesService, TGlobalEvents, TCommon>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties>,
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

export const AgInputTextAreaSelector: AgComponentSelector<AgComponentSelectorType> = {
    selector: 'AG-INPUT-TEXT-AREA',
    component: AgInputTextArea,
};

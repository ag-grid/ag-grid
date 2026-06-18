import type {
    AgBaseComponent,
    AgComponentSelector,
    AgCoreBeanCollection,
    AgElementParams,
    BaseEvents,
    BaseProperties,
    IPropertiesService,
} from 'ag-stack';
import { RefPlaceholder, _isComponent } from 'ag-stack';

import { AgAbstractLabel } from './agAbstractLabel';
import type { AgLabelParams } from './agFieldParams';
import agFieldSetCSS from './agFieldSet.css';
import type { AgWidgetSelectorType } from './agWidgetSelectorType';

type AgFieldSetItem<TBeanCollection> = AgBaseComponent<TBeanCollection> | HTMLElement;
type AgFieldSetDirection = 'horizontal' | 'vertical';

const AgFieldSetElement: AgElementParams<any> = {
    tag: 'div',
    cls: 'ag-field-set',
    role: 'group',
    children: [
        { tag: 'div', ref: 'eLabel' },
        { tag: 'div', ref: 'eWrapper', cls: 'ag-wrapper ag-field-set-wrapper ag-field-set-wrapper-horizontal' },
    ],
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgFieldSet<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TConfig extends AgLabelParams = AgLabelParams,
> extends AgAbstractLabel<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    TConfig
> {
    protected readonly eLabel: HTMLElement = RefPlaceholder;
    private readonly eWrapper: HTMLElement = RefPlaceholder;

    constructor(config?: TConfig) {
        super(config, AgFieldSetElement as AgElementParams<TComponentSelectorType>);
        this.registerCSS(agFieldSetCSS);
    }

    public override postConstruct(): void {
        super.postConstruct();

        this.addCss('ag-field-set');
        this.getGui().setAttribute('aria-labelledby', this.getLabelId());
    }

    public addItems(items: AgFieldSetItem<TBeanCollection>[]): void {
        for (const item of items) {
            this.addItem(item);
        }
    }

    public addItem(item: AgFieldSetItem<TBeanCollection>): void {
        const el = _isComponent(item) ? item.getGui() : item;

        this.eWrapper.appendChild(el);
    }

    public setDirection(direction: AgFieldSetDirection): this {
        const eWrapper = this.eWrapper;

        eWrapper.classList.toggle('ag-field-set-wrapper-horizontal', direction === 'horizontal');
        eWrapper.classList.toggle('ag-field-set-wrapper-vertical', direction === 'vertical');

        return this;
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const AgFieldSetSelector: AgComponentSelector<AgWidgetSelectorType> = {
    selector: 'AG-FIELD-SET',
    component: AgFieldSet,
};

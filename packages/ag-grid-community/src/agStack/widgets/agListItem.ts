import { AgComponentStub } from '../core/agComponentStub';
import { RefPlaceholder } from '../interfaces/agComponent';
import type { AgCoreBean } from '../interfaces/agCoreBean';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import type { ITooltipFeature, TooltipCtrl } from '../interfaces/iTooltip';
import type { HighlightTooltipEvent, HighlightTooltipEventType } from '../tooltip/agHighlightTooltipFeature';
import { _setAriaPosInSet, _setAriaSelected, _setAriaSetSize } from '../utils/aria';
import { _isHorizontalScrollShowing } from '../utils/dom';
import type { AgElementParams } from '../utils/dom';
import type { AgList, AgListEvent } from './agList';

const ACTIVE_CLASS = 'ag-active-item';

const getAgListElement = <TComponentSelectorType extends string>(
    cssIdentifier: string,
    label: string
): AgElementParams<TComponentSelectorType> => ({
    tag: 'div',
    cls: `ag-list-item ag-${cssIdentifier}-list-item`,
    attrs: { role: 'option' },
    children: [
        {
            tag: 'span',
            ref: 'eText',
            children: label,
        },
    ],
});

export class AgListItem<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TValue,
> extends AgComponentStub<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    HighlightTooltipEventType
> {
    private readonly eText: HTMLElement = RefPlaceholder;
    public tooltipFeature: ITooltipFeature;

    constructor(
        cssIdentifier: string,
        private readonly label: string,
        private readonly value: TValue
    ) {
        super(getAgListElement(cssIdentifier, label));
    }

    public postConstruct() {
        this.createTooltip();
        this.addEventListeners();
    }

    public setHighlighted(highlighted: boolean) {
        const eGui = this.getGui();
        eGui.classList.toggle(ACTIVE_CLASS, highlighted);
        _setAriaSelected(eGui, highlighted);
        this.dispatchLocalEvent<HighlightTooltipEvent>({
            type: 'itemHighlighted',
            highlighted,
        });
    }

    public getHeight(): number {
        return this.getGui().clientHeight;
    }

    public setIndex(idx: number, setSize: number): void {
        const eGui = this.getGui();
        _setAriaPosInSet(eGui, idx);
        _setAriaSetSize(eGui, setSize);
    }

    private createTooltip(): void {
        const tooltipCtrl = {
            getTooltipValue: () => this.label,
            getGui: () => this.getGui(),
            getLocation: () => 'UNKNOWN',
            // only show tooltips for items where the text cannot be fully displayed
            shouldDisplayTooltip: () => _isHorizontalScrollShowing(this.eText),
        } as TooltipCtrl<'UNKNOWN', any>;

        const tooltipFeature = this.createOptionalManagedBean(
            this.beans.registry.createDynamicBean<ITooltipFeature & AgCoreBean<TBeanCollection>>(
                'highlightTooltipFeature',
                false,
                tooltipCtrl,
                this
            )
        );

        if (tooltipFeature) {
            this.tooltipFeature = tooltipFeature;
        }
    }

    private addEventListeners(): void {
        const parentComponent =
            this.getParentComponent<
                AgList<
                    TBeanCollection,
                    TProperties,
                    TGlobalEvents,
                    TCommon,
                    TPropertiesService,
                    TComponentSelectorType,
                    AgListEvent,
                    TValue
                >
            >();

        if (!parentComponent) {
            return;
        }

        this.addGuiEventListener('mouseover', () => {
            parentComponent.highlightItem(this);
        });

        this.addGuiEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault();
            // `setValue` will already close the list popup, without stopPropagation
            // the mousedown event will close popups that own AgSelect
            e.stopPropagation();
            parentComponent.setValue(this.value);
        });
    }
}

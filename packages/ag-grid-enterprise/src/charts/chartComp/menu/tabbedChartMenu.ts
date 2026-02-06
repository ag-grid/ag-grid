import type { BeanCollection, ChartToolPanelMenuOptions } from 'ag-grid-community';
import { AgPromise, Component, _createElement } from 'ag-grid-community';

import { AgTabbedLayout } from '../../../agStack/agTabbedLayout';
import type { TabbedItem, TabbedLayout } from '../../../widgets/gridEnterpriseWidgetTypes';
import type { ChartTranslationKey, ChartTranslationService } from '../services/chartTranslationService';
import type { ChartMenuContext } from './chartMenuContext';
import { ChartDataPanel } from './data/chartDataPanel';
import { FormatPanel } from './format/formatPanel';
import { ChartSettingsPanel } from './settings/chartSettingsPanel';

const TAB_DATA = 'data';
const TAB_FORMAT = 'format';

type TabbedChartMenuEvent = 'closed';
export class TabbedChartMenu extends Component<TabbedChartMenuEvent> {
    private chartTranslation: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslation = beans.chartTranslation as ChartTranslationService;
    }

    private tabbedLayout: TabbedLayout;
    private readonly tabs: TabbedItem[] = [];
    private eventSource?: HTMLElement;

    constructor(
        private readonly panels: ChartToolPanelMenuOptions[],
        private readonly chartMenuContext: ChartMenuContext
    ) {
        super();
    }

    public postConstruct(): void {
        for (const panel of this.panels) {
            const panelType = panel.replace('chart', '').toLowerCase() as 'settings' | 'data' | 'format';
            const panelComp = this.createPanel(panelType);
            const tabItem = this.createTab(panel, panelType, panelComp);

            this.tabs.push(tabItem);
            this.addDestroyFunc(() => this.destroyBean(panelComp));
        }

        this.tabbedLayout = new AgTabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu',
            keepScrollPosition: true,
            suppressFocusBodyOnOpen: true,
            suppressTrapFocus: true,
            enableCloseButton: true,
            closeButtonAriaLabel: this.chartTranslation.translate('ariaChartMenuClose'),
            onCloseClicked: () => {
                this.eventSource?.focus({ preventScroll: true });
                this.dispatchLocalEvent({ type: 'closed' });
            },
        });
        this.createBean(this.tabbedLayout);
    }

    private createTab(name: ChartToolPanelMenuOptions, title: ChartTranslationKey, panelComp: Component): TabbedItem {
        const eWrapperDiv = _createElement({ tag: 'div', cls: `ag-chart-tab ag-chart-${title}` });

        this.createBean(panelComp);

        eWrapperDiv.appendChild(panelComp.getGui());

        const translatedTitle = this.chartTranslation.translate(title);
        const titleEl = _createElement({ tag: 'div', children: translatedTitle });

        return {
            title: titleEl,
            titleLabel: translatedTitle,
            bodyPromise: AgPromise.resolve(eWrapperDiv),
            getScrollableContainer: () => {
                const scrollableContainer = eWrapperDiv.querySelector('.ag-scrollable-container');
                return (scrollableContainer || eWrapperDiv) as HTMLElement;
            },
            name,
        };
    }

    public showTab(tab: number) {
        const tabItem = this.tabs[tab];
        this.tabbedLayout.showItem(tabItem);
    }

    public override getGui(): HTMLElement {
        return this.tabbedLayout?.getGui();
    }

    public showMenu(eventSource?: HTMLElement, suppressFocus?: boolean): void {
        this.eventSource = eventSource;
        if (!suppressFocus) {
            this.tabbedLayout?.focusHeader(true);
        }
    }

    public override destroy(): void {
        if (this.parentComponent?.isAlive()) {
            this.destroyBean(this.parentComponent);
        }
        super.destroy();
    }

    private createPanel(panelType: string): Component {
        switch (panelType) {
            case TAB_DATA:
                return new ChartDataPanel(this.chartMenuContext);
            case TAB_FORMAT:
                return new FormatPanel(this.chartMenuContext);
            default:
                return new ChartSettingsPanel(this.chartMenuContext.chartController);
        }
    }
}

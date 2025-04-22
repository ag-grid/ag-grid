import type { ChartType, Component } from 'ag-grid-community';
import { BeanStub, _removeFromParent } from 'ag-grid-community';

import type { ChartController } from '../chartController';
import type { ChartSeriesType } from '../utils/seriesTypeMapper';
import { getSeriesType } from '../utils/seriesTypeMapper';

export class ChartPanelFeature extends BeanStub {
    private chartType: ChartType;
    private isGrouping: boolean;
    private panels: Component[] = [];

    constructor(
        private readonly chartController: ChartController,
        private readonly eGui: HTMLElement,
        private readonly cssClass: string,
        private readonly createPanels: (chartType: ChartType, seriesType: ChartSeriesType) => void
    ) {
        super();
    }

    public postConstruct(): void {
        this.addManagedListeners(this.chartController, {
            chartUpdated: () => this.refreshPanels(true),
            chartApiUpdate: () => this.refreshPanels(false),
        });
    }

    public addComponent(component: Component): void {
        this.createBean(component);
        this.panels.push(component);
        component.addCss(this.cssClass);
        this.eGui.appendChild(component.getGui());
    }

    public refreshPanels(reuse?: boolean) {
        const chartType = this.chartController.getChartType();
        const isGrouping = this.chartController.isGrouping();
        const seriesType = getSeriesType(chartType);

        if (reuse && chartType === this.chartType && isGrouping === this.isGrouping) {
            // existing panels can be re-used
            return;
        }

        this.destroyPanels();

        this.createPanels(chartType, seriesType);

        this.chartType = chartType;
        this.isGrouping = isGrouping;
    }

    private destroyPanels(): void {
        this.panels.forEach((panel) => {
            _removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
        this.panels = [];
    }

    public override destroy(): void {
        this.destroyPanels();
        super.destroy();
    }
}

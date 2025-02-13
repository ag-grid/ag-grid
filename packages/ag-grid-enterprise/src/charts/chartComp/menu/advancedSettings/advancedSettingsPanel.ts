import type { ChartType } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import type { ChartSeriesType } from '../../utils/seriesTypeMapper';
import { isCartesian, isFunnel } from '../../utils/seriesTypeMapper';
import type { ChartMenuContext } from '../chartMenuContext';
import { ChartPanelFeature } from '../chartPanelFeature';
import { AnimationPanel } from './interactivity/animationPanel';
import { CrosshairPanel } from './interactivity/crosshairPanel';
import { NavigatorPanel } from './interactivity/navigatorPanel';
import { ZoomPanel } from './interactivity/zoomPanel';

const INTERACTIVITY_GROUPS = ['navigator', 'zoom', 'animation', 'crosshair'] as const;

type ChartInteractivityGroup = (typeof INTERACTIVITY_GROUPS)[number];

export class AdvancedSettingsPanel extends Component {
    private chartPanelFeature: ChartPanelFeature;

    constructor(private readonly chartMenuContext: ChartMenuContext) {
        super(/* html */ `<div class="ag-chart-advanced-settings-wrapper"></div>`);
    }

    public postConstruct(): void {
        this.chartPanelFeature = this.createManagedBean(
            new ChartPanelFeature(
                this.chartMenuContext.chartController,
                this.getGui(),
                'ag-chart-advanced-settings-section',
                (chartType, seriesType) => this.createPanels(chartType, seriesType)
            )
        );
        this.chartPanelFeature.refreshPanels();
    }

    private createPanels(chartType: ChartType, seriesType: ChartSeriesType): void {
        INTERACTIVITY_GROUPS.forEach((group) => {
            if (!this.isGroupPanelShownForSeries(group, seriesType)) {
                return;
            }

            const comp = this.createPanel(group);
            this.chartPanelFeature.addComponent(comp);
        });
    }

    private isGroupPanelShownForSeries(group: ChartInteractivityGroup, seriesType: ChartSeriesType): boolean {
        return group === 'animation' || (isCartesian(seriesType) && !isFunnel(seriesType));
    }

    private createPanel(group: ChartInteractivityGroup): Component {
        const { chartMenuParamsFactory, chartAxisMenuParamsFactory } = this.chartMenuContext;
        switch (group) {
            case 'navigator':
                return new NavigatorPanel(chartMenuParamsFactory);
            case 'zoom':
                return new ZoomPanel(chartMenuParamsFactory);
            case 'animation':
                return new AnimationPanel(chartMenuParamsFactory);
            case 'crosshair':
                return new CrosshairPanel(chartAxisMenuParamsFactory);
        }
    }
}

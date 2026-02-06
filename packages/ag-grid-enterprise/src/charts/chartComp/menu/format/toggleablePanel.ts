import { Component, RefPlaceholder, _removeFromParent } from 'ag-grid-community';

import { AgGroupComponentSelector } from '../../../../agStack/agGroupComponent';
import type { GroupComponent, GroupComponentParams } from '../../../../widgets/gridEnterpriseWidgetTypes';
import type { ChartOptionsProxy } from '../../services/chartOptionsService';
import type { ChartMenuParamsFactory } from '../chartMenuParamsFactory';

interface ToggleablePanelParams {
    tag: string;
    title?: string;
    suppressEnabledCheckbox?: boolean;
    chartMenuParamsFactory: ChartMenuParamsFactory;
    cssIdentifier?: string;
}

export class ToggleablePanel extends Component {
    private readonly toggleableGroup: GroupComponent = RefPlaceholder;

    private readonly chartOptions: ChartOptionsProxy;
    private readonly activeComps: Component[] = [];

    constructor(private readonly params: ToggleablePanelParams) {
        super();
        this.chartOptions = params.chartMenuParamsFactory.getChartOptions();
    }

    public postConstruct() {
        const { tag, cssIdentifier = 'charts-format-sub-level', title, suppressEnabledCheckbox } = this.params;
        const groupParams: GroupComponentParams =
            this.params.chartMenuParamsFactory.addEnableParams<GroupComponentParams>(`${tag}.enabled`, {
                cssIdentifier,
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title,
                suppressEnabledCheckbox: true,
                useToggle: !suppressEnabledCheckbox,
            });
        this.setTemplate(
            /* html */ `<div class="ag-toggleable-group-panel">
                <ag-group-component data-ref="toggleableGroup">
                </ag-group-component>
            </div>`,
            [AgGroupComponentSelector],
            {
                toggleableGroup: groupParams,
            }
        );
        this.toggleCss(`ag-toggleable-group-panel-no-header`, !title);
    }

    public addItem(comp: Component<any>, prepend?: boolean) {
        if (prepend) {
            this.toggleableGroup.prependItem(comp);
        } else {
            this.toggleableGroup.addItem(comp);
        }
        this.activeComps.push(comp);
    }

    public setEnabled(enabled: boolean): void {
        this.toggleableGroup.setEnabled(enabled);
    }

    private destroyActiveComps(): void {
        for (const comp of this.activeComps) {
            _removeFromParent(comp.getGui());
            this.destroyBean(comp);
        }
    }

    public override destroy(): void {
        this.destroyActiveComps();
        super.destroy();
    }
}

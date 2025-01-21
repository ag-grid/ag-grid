import { Component, RefPlaceholder, _removeFromParent } from 'ag-grid-community';

import type { AgGroupComponent, AgGroupComponentParams } from '../../../../widgets/agGroupComponent';
import { AgGroupComponentSelector } from '../../../../widgets/agGroupComponent';
import type { ChartOptionsProxy } from '../../services/chartOptionsService';
import type { ChartMenuParamsFactory } from '../chartMenuParamsFactory';

export interface ToggleablePanelParams {
    tag: string;
    title?: string;
    enabled: boolean;
    suppressEnabledCheckbox?: boolean;
    onEnableChange?: (enabled: boolean) => void;
    chartMenuParamsFactory: ChartMenuParamsFactory;
    cssIdentifier?: string;
}

export class ToggleablePanel extends Component {
    private readonly dropOffGroup: AgGroupComponent = RefPlaceholder;

    private readonly chartOptions: ChartOptionsProxy;
    private activeComps: Component[] = [];
    private groupName: string;

    private get component(): AgGroupComponent {
        return (this as any)[this.groupName];
    }

    private set component(component: AgGroupComponent) {
        (this as any)[this.groupName] = component;
    }

    constructor(private readonly params: ToggleablePanelParams) {
        super();
        this.groupName = `${params.tag}Group`;
        this.component = RefPlaceholder;
        this.chartOptions = params.chartMenuParamsFactory.getChartOptions();
    }

    public postConstruct() {
        const {
            tag,
            cssIdentifier = 'charts-format-sub-level',
            title,
            enabled,
            onEnableChange,
            suppressEnabledCheckbox,
        } = this.params;
        const dropOffGroupParams: AgGroupComponentParams =
            this.params.chartMenuParamsFactory.addEnableParams<AgGroupComponentParams>(`${tag}.enabled`, {
                cssIdentifier,
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title,
                enabled,
                suppressEnabledCheckbox: true,
                onEnableChange: (enabled) => {
                    if (onEnableChange) {
                        onEnableChange(enabled);
                    }
                },
                useToggle: !suppressEnabledCheckbox,
            });
        this.setTemplate(
            /* html */ `<div class="ag-${tag}-panel">
                <ag-group-component data-ref="${tag}Group">
                </ag-group-component>
            </div>`,
            [AgGroupComponentSelector],
            {
                [`${tag}Group`]: dropOffGroupParams,
            }
        );
        this.addOrRemoveCssClass(`ag-${tag}-panel-no-header`, !title);
    }

    public addItem(comp: Component<any>, prepend?: boolean) {
        if (prepend) {
            this.component.prependItem(comp);
        } else {
            this.component.addItem(comp);
        }
        this.activeComps.push(comp);
    }

    public setEnabled(enabled: boolean): void {
        this.component.setEnabled(enabled);
    }

    private destroyActiveComps(): void {
        this.activeComps.forEach((comp) => {
            _removeFromParent(comp.getGui());
            this.destroyBean(comp);
        });
    }

    public override destroy(): void {
        this.destroyActiveComps();
        super.destroy();
    }
}

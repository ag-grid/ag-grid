import { Bean, BeanStub } from '@ag-grid-community/core';

import { SparklineTooltip } from '../sparkline/tooltip/sparklineTooltip';

/**
 * This 'bean' creates a single sparkline tooltip that is bound to the grid lifecycle.
 */
@Bean('sparklineTooltipSingleton')
export class SparklineTooltipSingleton extends BeanStub {
    private tooltip!: SparklineTooltip;

    protected override postConstruct(): void {
        super.postConstruct();
        this.tooltip = new SparklineTooltip();
    }

    public getSparklineTooltip() {
        return this.tooltip;
    }

    protected override destroy(): void {
        if (this.tooltip) {
            this.tooltip.destroy();
        }
        super.destroy();
    }
}

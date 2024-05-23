import { Bean, BeanStub } from '@ag-grid-community/core';

import { SparklineTooltip } from '../sparkline/tooltip/sparklineTooltip';

/**
 * This 'bean' creates a single sparkline tooltip that is bound to the grid lifecycle.
 */
@Bean('sparklineTooltipSingleton')
export class SparklineTooltipSingleton extends BeanStub {
    private tooltip!: SparklineTooltip;

    public postConstruct(): void {
        this.tooltip = new SparklineTooltip();
    }

    public getSparklineTooltip() {
        return this.tooltip;
    }

    public override destroy(): void {
        if (this.tooltip) {
            this.tooltip.destroy();
        }
        super.destroy();
    }
}

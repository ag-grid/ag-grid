import type { NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import { SparklineTooltip } from '../sparkline/tooltip/sparklineTooltip';
/**
 * This 'bean' creates a single sparkline tooltip that is bound to the grid lifecycle.
 */
export declare class SparklineTooltipSingleton extends BeanStub implements NamedBean {
    beanName: "sparklineTooltipSingleton";
    private tooltip;
    postConstruct(): void;
    getSparklineTooltip(): SparklineTooltip;
    destroy(): void;
}

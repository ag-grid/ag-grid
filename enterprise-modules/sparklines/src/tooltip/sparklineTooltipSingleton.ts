import { Bean, BeanStub, PreDestroy, PostConstruct, Autowired, LoggerFactory, Logger } from "@ag-grid-community/core";
import { SparklineTooltip } from "../sparkline/tooltip/sparklineTooltip";

@Bean('sparklineTooltipSingleton')
export class SparklineTooltipSingleton extends BeanStub {

    @Autowired('loggerFactory') private readonly loggerFactory!: LoggerFactory;

    private logger!: Logger;
    private tooltip!: SparklineTooltip;

    @PostConstruct
    private postConstruct(): void {
        this.logger = this.loggerFactory.create('SparklineTooltipSingleton');
        this.logger.log('creating new sparkline tooltip ');
        this.tooltip = new SparklineTooltip();
    }

    public getSparklineTooltip() {
        return this.tooltip;
    }

    @PreDestroy
    private destroyTooltip(): void {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.logger.log('sparkline tooltip destroyed');
        }
    }
}
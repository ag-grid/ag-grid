import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";

import { AgChartInstance, AgChart, AgChartOptions } from 'ag-charts-community';

// noinspection AngularIncorrectTemplateDefinition
@Component({
    selector: 'ag-charts-angular',
    template: '',
    encapsulation: ViewEncapsulation.None
})
export class AgChartsAngular implements AfterViewInit {

    private _nativeElement: any;
    private _initialised = false;
 
    public chart?: AgChartInstance;

    @Input()
    public options: AgChartOptions = {};

    @Output()
    public onChartReady: EventEmitter<AgChartInstance> = new EventEmitter();

    constructor(elementDef: ElementRef) {
        this._nativeElement = elementDef.nativeElement;
    }

    ngAfterViewInit(): void {
        const options = this.applyContainerIfNotSet(this.options);

        this.chart = AgChart.create(options);
        this._initialised = true;

        (this.chart as any).chart.waitForUpdate()
            .then(() => {
                this.onChartReady.emit(this.chart);
            });
    }

    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    ngOnChanges(changes: any): void {
        if (!this._initialised || !this.chart) {
            return;
        }

        AgChart.update(this.chart, this.applyContainerIfNotSet(this.options));
    }

    public ngOnDestroy(): void {
        if (this._initialised && this.chart) {
            this.chart.destroy();
            this.chart = undefined;
            this._initialised = false;
        }
    }

    private applyContainerIfNotSet(propsOptions: AgChartOptions) {
        if (propsOptions.container) {
            return propsOptions;
        }

        return {...propsOptions, container: this._nativeElement};
    }
}

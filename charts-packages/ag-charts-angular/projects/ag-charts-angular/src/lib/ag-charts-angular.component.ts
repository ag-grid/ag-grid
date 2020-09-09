import {AfterViewInit, Component, ElementRef, Input, ViewEncapsulation} from "@angular/core";

import { Chart, AgChart, AgChartOptions } from 'ag-charts-community';

// noinspection AngularIncorrectTemplateDefinition
@Component({
    selector: 'ag-charts-angular',
    template: '',
    encapsulation: ViewEncapsulation.None
})
export class AgChartsAngular implements AfterViewInit {

    private _nativeElement: any;
    private _initialised = false;
    private _destroyed = false;

    private _chart!: Chart;

    @Input()
    public options!: AgChartOptions;

    constructor(elementDef: ElementRef) {
        this._nativeElement = elementDef.nativeElement;
    }

    ngAfterViewInit(): void {
        const options = this.applyContainerIfNotSet(this.options);

        this._chart = AgChart.create(options);

        this._initialised = true;
    }

  // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    ngOnChanges(changes: any): void {
        if (this._initialised) {
            AgChart.update(this._chart, this.applyContainerIfNotSet(this.options));
        }
    }

    public ngOnDestroy(): void {
        if (this._initialised) {
            if (this._chart) {
                this._chart.destroy();
            }
            this._destroyed = true;
        }
    }

    private applyContainerIfNotSet(propsOptions: AgChartOptions) {
        if (propsOptions.container) {
            return propsOptions;
        }

        return {...propsOptions, container: this._nativeElement};
    }
}

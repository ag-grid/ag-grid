import { Component } from '@angular/core';
import { AgChartOptions } from 'ag-charts-angular';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    options: AgChartOptions;

    constructor() {
        this.options = $OPTIONS$;
    }
}

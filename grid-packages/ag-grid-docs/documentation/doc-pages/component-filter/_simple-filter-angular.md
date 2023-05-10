<framework-specific-section frameworks="angular">
|Below is a simple example of filter component class:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|import {IFilterAngularComp} from "ag-grid-angular";
|import {IDoesFilterPassParams, IFilterParams} from "ag-grid-community";
|
|@Component({
|    selector: 'year-filter',
|    template: `
|      &lt;div style="display: inline-block; width: 400px;">
|           &lt;div style="padding: 10px; background-color: #d3d3d3; text-align: center;">This is a very wide filter&lt;/div>
|           &lt;label style="margin: 10px; padding: 50px; display: inline-block; background-color: #999999">
|               &lt;input type="radio" name="year" [(ngModel)]="year" (ngModelChange)="updateFilter()" [value]="'All'"/> All
|           &lt;/label>
|           &lt;label style="margin: 10px; padding: 50px; display: inline-block; background-color: #999999">
|               &lt;input type="radio" name="year" [(ngModel)]="year" (ngModelChange)="updateFilter()" [value]="'2010'"/> Since 2010
|           &lt;/label>
|      &lt;/div>
|    `
|})
|export class YearFilter implements IFilterAngularComp {
|    params: IFilterParams;
|    year: string = 'All';
|
|    agInit(params: IFilterParams): void {
|        this.params = params;
|    }
|
|    isFilterActive(): boolean {
|        return this.year === '2010'
|    }
|
|    doesFilterPass(params: IDoesFilterPassParams): boolean {
|        return params.data.year >= 2010;
|    }
|
|    getModel() {
|    }
|
|    setModel(model: any) {
|    }
|
|    updateFilter() {
|        this.params.filterChangedCallback();
|    }
|}
</snippet>
</framework-specific-section>
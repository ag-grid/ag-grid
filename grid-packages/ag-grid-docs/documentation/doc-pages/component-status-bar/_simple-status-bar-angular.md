<framework-specific-section frameworks="angular">
|
|Below is an example of a status bar component:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|import { Component } from "@angular/core";
|import { IStatusPanelAngularComp } from 'ag-grid-angular';
|import { IStatusPanelParams } from "ag-grid-community";
|
|@Component({
|    selector: 'status-component',
|    template: `&lt;input type="button" (click)="onClick()" value="Click Me For Selected Row Count"/>`,
|    styles: [ 'input { padding: 5px; margin: 5px }']
|})
|export class ClickableStatusBarComponent implements IStatusPanelAngularComp {
|    private params: IStatusPanelParams;
|
|    agInit(params: IStatusPanelParams): void {
|        this.params = params;
|    }
|
|    onClick(): void {
|        alert('Selected Row Count: ' + this.params.api.getSelectedRows().length)
|    }
|}
</snippet>
</framework-specific-section>
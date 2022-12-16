[[only-angular]]
|
|Below is a simple example of a tool panel component:
|
|```js
|import {Component} from "@angular/core";
|import {IToolPanelParams, IRowNode} from "ag-grid-community";
|import {IToolPanelAngularComp} from "ag-grid-angular";
|
|@Component({
|    selector: 'custom-stats',
|    template: `
|      <div style="text-align: center">
|      <span>
|                <h2><i class="fa fa-calculator"></i> Custom Stats</h2>
|                <dl style="font-size: large; padding: 30px 40px 10px 30px">
|                    <dt class="totalStyle">Total Medals: <b>{{ numMedals }}</b></dt>
|                    <dt class="totalStyle">Total Gold: <b>{{ numGold }}</b></dt>
|                    <dt class="totalStyle">Total Silver: <b>{{ numSilver }}</b></dt>
|                    <dt class="totalStyle">Total Bronze: <b>{{ numBronze }}</b></dt>
|                </dl>
|            </span>
|      </div>`,
|    styles: [`
|        .totalStyle {
|            padding-bottom: 15px
|        }
|    `]
|})
|export class CustomStatsToolPanel implements IToolPanelAngularComp {
|    private params: IToolPanelParams;
|
|    public numMedals: number;
|    public numGold: number;
|    public numSilver: number;
|    public numBronze: number;
|
|    agInit(params: IToolPanelParams): void {
|        this.params = params;
|
|        this.numMedals = 0;
|        this.numGold = 0;
|        this.numSilver = 0;
|        this.numBronze = 0;
|
|        // calculate stats when new rows loaded, i.e. onModelUpdated
|        this.params.api.addEventListener('modelUpdated', this.updateTotals.bind(this));
|    }
|
|    updateTotals(): void {
|        let numGold = 0, numSilver = 0, numBronze = 0;
|
|        this.params.api.forEachNode((rowNode:IRowNode) => {
|            const data = rowNode.data;
|            if (data.gold) numGold += data.gold;
|            if (data.silver) numSilver += data.silver;
|            if (data.bronze) numBronze += data.bronze;
|        });
|
|        this.numMedals = numGold + numSilver + numBronze;
|        this.numGold = numGold;
|        this.numSilver = numSilver;
|        this.numBronze = numBronze;
|    }
|}
|```

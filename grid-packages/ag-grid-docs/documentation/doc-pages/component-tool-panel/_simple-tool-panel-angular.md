<framework-specific-section frameworks="angular">
|Below is an example of a tool panel component:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|import {Component} from "@angular/core";
|import {IToolPanelParams, IRowNode} from "ag-grid-community";
|import {IToolPanelAngularComp} from "ag-grid-angular";
|
|@Component({
|    selector: 'custom-stats',
|    template: `
|      &lt;div style="text-align: center">
|      &lt;span>
|                &lt;h2>&lt;i class="fa fa-calculator">&lt;/i> Custom Stats&lt;/h2>
|                &lt;dl style="font-size: large; padding: 30px 40px 10px 30px">
|                    &lt;dt class="totalStyle">Total Medals: &lt;b>{{ numMedals }}&lt;/b>&lt;/dt>
|                    &lt;dt class="totalStyle">Total Gold: &lt;b>{{ numGold }}&lt;/b>&lt;/dt>
|                    &lt;dt class="totalStyle">Total Silver: &lt;b>{{ numSilver }}&lt;/b>&lt;/dt>
|                    &lt;dt class="totalStyle">Total Bronze: &lt;b>{{ numBronze }}&lt;/b>&lt;/dt>
|                &lt;/dl>
|            &lt;/span>
|      &lt;/div>`,
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
</snippet>
</framework-specific-section>
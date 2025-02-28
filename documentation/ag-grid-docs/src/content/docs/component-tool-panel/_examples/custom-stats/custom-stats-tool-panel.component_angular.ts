import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { IToolPanelAngularComp } from 'ag-grid-angular';
import type { IRowNode, IToolPanelParams } from 'ag-grid-community';

export interface CustomStatsToolPanelParams extends IToolPanelParams {
    title: string;
}

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ` <div style="text-align: center">
        <span>
            <h2><i class="fa fa-calculator"></i> {{ title() }}</h2>
            <dl style="font-size: large; padding: 30px 40px 10px 30px">
                <dt class="totalStyle">
                    Total Medals: <b>{{ numMedals() }}</b>
                </dt>
                <dt class="totalStyle">
                    Total Gold: <b>{{ numGold() }}</b>
                </dt>
                <dt class="totalStyle">
                    Total Silver: <b>{{ numSilver() }}</b>
                </dt>
                <dt class="totalStyle">
                    Total Bronze: <b>{{ numBronze() }}</b>
                </dt>
            </dl>
        </span>
    </div>`,
    styles: [
        `
            .totalStyle {
                padding-bottom: 15px;
            }
        `,
    ],
})
export class CustomStatsToolPanel implements IToolPanelAngularComp {
    private params!: CustomStatsToolPanelParams;

    numMedals = signal(0);
    numGold = signal(0);
    numSilver = signal(0);
    numBronze = signal(0);
    title = signal('');

    agInit(params: CustomStatsToolPanelParams): void {
        this.params = params;
        this.title.set(params.title);

        // calculate stats when new rows loaded, i.e. onModelUpdated
        this.params.api.addEventListener('modelUpdated', this.updateTotals.bind(this));
    }

    updateTotals(): void {
        let numGold = 0,
            numSilver = 0,
            numBronze = 0;

        this.params.api.forEachNode((rowNode: IRowNode) => {
            const data = rowNode.data;
            if (data.gold) numGold += data.gold;
            if (data.silver) numSilver += data.silver;
            if (data.bronze) numBronze += data.bronze;
        });

        this.numMedals.set(numGold + numSilver + numBronze);
        this.numGold.set(numGold);
        this.numSilver.set(numSilver);
        this.numBronze.set(numBronze);
    }

    refresh(): void {}
}

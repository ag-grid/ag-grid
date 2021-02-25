import { Component } from '@angular/core';
import { ICellRenderer } from "@ag-grid-community/angular";

@Component({
    selector: 'app-loading-cell-renderer',
    template: `<span class="calls-cell-renderer">
                    <button (click)="onAdd()">+</button>
                    <button (click)="onRemove()">-</button>
                    <span>{{value}}</span>
                </span>`
})
export class CallsCellRenderer implements ICellRenderer {

    private params: any;

    private value: number;

    agInit(params: any): void {
        this.params = params;
        this.value = params.value;
    }

    onAdd(): void {
        var oldData = this.params.node.data;

        var oldCallRecords = oldData.callRecords;

        var newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.push({
            name: ["Bob","Paul","David","John"][Math.floor(Math.random()*4)],
            callId: Math.floor(Math.random()*1000),
            duration: Math.floor(Math.random()*100) + 1,
            switchCode: "SW5",
            direction: "Out",
            number: "(02) " + Math.floor(Math.random()*1000000)
        }); // add one item

        var minutes = 0;
        newCallRecords.forEach( (r: any) => minutes += r.duration );

        var newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords
        };

        this.params.api.applyTransaction({update: [newData]});

        this.params.node.setExpanded(true);
    }

    onRemove(): void {

        var oldData = this.params.node.data;

        var oldCallRecords = oldData.callRecords;

        if (oldCallRecords.length==0) { return; }

        var newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.pop(); // remove one item

        var minutes = 0;
        newCallRecords.forEach( (r:any) => minutes += r.duration );

        var newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords
        };

        this.params.api.applyTransaction({update: [newData]});
    }
}

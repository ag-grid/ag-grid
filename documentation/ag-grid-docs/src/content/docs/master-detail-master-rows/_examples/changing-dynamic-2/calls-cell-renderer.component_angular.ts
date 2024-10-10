import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

import { pRandom } from './random';

@Component({
    standalone: true,
    template: `<span class="calls-cell-renderer">
        <button (click)="onAdd()">+</button>
        <button (click)="onRemove()">-</button>
        <span>{{ value }}</span>
    </span>`,
})
export class CallsCellRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    public value!: number;

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.value = params.value;
    }

    onAdd(): void {
        const oldData = this.params.node.data;

        const oldCallRecords = oldData.callRecords;

        const newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.push({
            name: ['Bob', 'Paul', 'David', 'John'][Math.floor(pRandom() * 4)],
            callId: Math.floor(pRandom() * 1000),
            duration: Math.floor(pRandom() * 100) + 1,
            switchCode: 'SW5',
            direction: 'Out',
            number: '(02) ' + Math.floor(pRandom() * 1000000),
        }); // add one item

        let minutes = 0;
        newCallRecords.forEach((r: any) => (minutes += r.duration));

        const newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords,
        };

        this.params.api.applyTransaction({ update: [newData] });

        this.params.node.setExpanded(true);
    }

    onRemove(): void {
        const oldData = this.params.node.data;

        const oldCallRecords = oldData.callRecords;

        if (oldCallRecords.length == 0) {
            return;
        }

        const newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.pop(); // remove one item

        let minutes = 0;
        newCallRecords.forEach((r: any) => (minutes += r.duration));

        const newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords,
        };

        this.params.api.applyTransaction({ update: [newData] });
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

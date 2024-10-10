import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

import { pRandom } from './random';

export class CallsCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;
    eValue: any;

    init(params: ICellRendererParams) {
        const eTemp = document.createElement('div');
        eTemp.innerHTML =
            '<span class="calls-cell-renderer">' +
            '<button data-ref="btAdd">+</button>' +
            '<button data-ref="btRemove">-</button>' +
            '<span data-ref="eValue"></span>' +
            '</span>';

        this.eGui = eTemp.firstChild as HTMLElement;

        this.eValue = this.eGui.querySelector('[data-ref="eValue"]');
        const btAdd = this.eGui.querySelector('[data-ref="btAdd"]')!;
        const btRemove = this.eGui.querySelector('[data-ref="btRemove"]')!;

        btAdd.addEventListener('click', this.onBtAdd.bind(this, params));
        btRemove.addEventListener('click', this.onBtRemove.bind(this, params));

        this.refresh(params);
    }

    onBtRemove(params: ICellRendererParams) {
        const oldData = params.node.data;

        const oldCallRecords = oldData.callRecords;

        if (oldCallRecords.length == 0) {
            return;
        }

        const newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.pop(); // remove one item

        let minutes = 0;
        newCallRecords.forEach(function (r: any) {
            minutes += r.duration;
        });

        const newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords,
        };

        params.api.applyTransaction({ update: [newData] });
    }

    onBtAdd(params: ICellRendererParams) {
        const oldData = params.node.data;

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
        newCallRecords.forEach(function (r: any) {
            minutes += r.duration;
        });

        const newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords,
        };

        params.api.applyTransaction({ update: [newData] });

        params.node.setExpanded(true);
    }

    refresh(params: ICellRendererParams) {
        this.eValue.innerHTML = params.value;
        return true;
    }

    getGui() {
        return this.eGui;
    }
}

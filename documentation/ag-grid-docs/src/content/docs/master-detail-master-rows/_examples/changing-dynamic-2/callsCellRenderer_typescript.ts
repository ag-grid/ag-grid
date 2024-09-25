import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class CallsCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;
    eValue: any;

    init(params: ICellRendererParams) {
        var eTemp = document.createElement('div');
        eTemp.innerHTML =
            '<span class="calls-cell-renderer">' +
            '<button data-ref="btAdd">+</button>' +
            '<button data-ref="btRemove">-</button>' +
            '<span data-ref="eValue"></span>' +
            '</span>';

        this.eGui = eTemp.firstChild as HTMLElement;

        this.eValue = this.eGui.querySelector('[data-ref="eValue"]');
        var btAdd = this.eGui.querySelector('[data-ref="btAdd"]')!;
        var btRemove = this.eGui.querySelector('[data-ref="btRemove"]')!;

        btAdd.addEventListener('click', this.onBtAdd.bind(this, params));
        btRemove.addEventListener('click', this.onBtRemove.bind(this, params));

        this.refresh(params);
    }

    onBtRemove(params: ICellRendererParams) {
        var oldData = params.node.data;

        var oldCallRecords = oldData.callRecords;

        if (oldCallRecords.length == 0) {
            return;
        }

        var newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.pop(); // remove one item

        var minutes = 0;
        newCallRecords.forEach(function (r: any) {
            minutes += r.duration;
        });

        var newData = {
            name: oldData.name,
            account: oldData.account,
            calls: newCallRecords.length,
            minutes: minutes,
            callRecords: newCallRecords,
        };

        params.api.applyTransaction({ update: [newData] });
    }

    onBtAdd(params: ICellRendererParams) {
        var oldData = params.node.data;

        var oldCallRecords = oldData.callRecords;

        var newCallRecords = oldCallRecords.slice(0); // make a copy
        newCallRecords.push({
            name: ['Bob', 'Paul', 'David', 'John'][Math.floor(Math.random() * 4)],
            callId: Math.floor(Math.random() * 1000),
            duration: Math.floor(Math.random() * 100) + 1,
            switchCode: 'SW5',
            direction: 'Out',
            number: '(02) ' + Math.floor(Math.random() * 1000000),
        }); // add one item

        var minutes = 0;
        newCallRecords.forEach(function (r: any) {
            minutes += r.duration;
        });

        var newData = {
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

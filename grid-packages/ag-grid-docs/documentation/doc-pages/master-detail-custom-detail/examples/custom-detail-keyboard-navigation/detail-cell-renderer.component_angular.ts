import { Component } from '@angular/core';
import { ICellRendererAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'app-detail-cell-renderer',
    template: `
        <div>
            <form>
                <div>
                    <p>
                        <label>
                            Call Id:<br>
                            <input type="text" value={{firstRecord.callId}}>
                        </label>
                    </p>
                    <p>
                        <label>
                            Number:<br>
                            <input type="text" value={{firstRecord.number}}>
                        </label>
                    </p>
                    <p>
                        <label>
                            Direction:<br>
                            <input type="text" value={{firstRecord.direction}}>
                        </label>
                    </p>
                </div>
            </form>
        </div>
    `
})
export class DetailCellRenderer implements ICellRendererAngularComp {
    firstRecord!: any;
    eParentEl!: HTMLElement;

    // called on init
    agInit(params: any): void {
        this.firstRecord = params.data.callRecords[0];
        this.eParentEl = params.eParentOfValue;
        this.eParentEl.addEventListener('focus', this.onParentElFocus);
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }

    onParentElFocus(event: FocusEvent) {
        const currentEl = event.target as HTMLElement;
        const previousEl = event.relatedTarget as HTMLElement;
        const previousRowEl = findRowForEl(previousEl);
        const currentRow = currentEl && parseInt(currentEl.getAttribute('row-index')!, 10);
        const previousRow = previousRowEl && parseInt(previousRowEl.getAttribute('row-index')!, 10);

        const inputs = currentEl.querySelectorAll('input');
      
        // Navigating forward, or unknown previous row
        if (!previousRow || currentRow >= previousRow) {
            // Focus on the first input
            inputs[0].focus();
        } else { // Navigating backwards
            // Focus on the last input
            inputs[inputs.length - 1].focus();
        }
    }

    destroy() {
        this.eParentEl.removeEventListener('focus', this.onParentElFocus);
    }
}

const findRowForEl = (el: HTMLElement): HTMLElement | null => {
    let rowEl: HTMLElement | null = el;
    while (rowEl) {
        rowEl = rowEl.parentElement;
        if (rowEl && rowEl.getAttribute('role') === 'row') { return rowEl; }
    }

    return null;
}
import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { toCurrency } from './formatters';
import styles from './currentCellRenderer.module.scss';

export class CurrentCellRenderer implements ICellRendererComp {
    private lastValue: number;

    eGui!: HTMLSpanElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('span');
        this.eGui.classList.add(styles.current);
        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh({ value }: ICellRendererParams): boolean {
        if (value === this.lastValue) {
            return false;
        }

        this.eGui.innerHTML = toCurrency({ value, decimalPlaces: 2 });

        this.eGui.classList.add(styles.update);
        
        window.setTimeout(
          () => {this.eGui.classList.remove(styles.update)},
        100)

        this.lastValue = value;

        return true;
    }
}
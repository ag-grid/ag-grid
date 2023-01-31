import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { toCurrency } from './formatters';
import styles from './currentCellRenderer.module.scss';
import { SHOW_CURRENT_COLORS_BREAKPOINT } from './constants';

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

        // Show change in values using classes
        const change: number = value - this.lastValue;
        const positiveClass = styles.positive;
        const negativeClass = styles.negative;
        if (change === 0) {
            this.eGui.classList.remove(negativeClass);
            this.eGui.classList.remove(positiveClass);
        } else if (change > 0) {
            this.eGui.classList.remove(negativeClass);
            this.eGui.classList.add(positiveClass);
        } else {
            this.eGui.classList.remove(positiveClass);
            this.eGui.classList.add(negativeClass);
        }
        
        // Update value
        const currencyValue = toCurrency({ value });
        this.eGui.innerHTML = currencyValue;

        this.eGui.classList.add(styles.update);

        // Add class if smaller screen
        if (innerWidth < SHOW_CURRENT_COLORS_BREAKPOINT) {
            this.eGui.classList.add(styles.showColors);
        } else {
            this.eGui.classList.remove(styles.showColors);

            // Flash update styles on larger screens
            window.setTimeout(
                () => {this.eGui.classList.remove(styles.update)},
            100);
        }

        this.lastValue = value;

        return true;
    }
}
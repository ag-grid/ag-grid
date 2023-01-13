import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { toPercentage } from './formatters';
import styles from './changeCellRenderer.module.scss';

export class ChangeCellRenderer implements ICellRendererComp {
    private lastValue: number;

    eGui!: HTMLSpanElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('span');
        this.eGui.classList.add(styles.changeValue);
        this.refresh(params);
    }

    getGui() {
        return this.eGui;
    }

    refresh({ value }: ICellRendererParams): boolean {
        if (value === this.lastValue) {
            return false;
        }

        const positiveClass = styles.positive;
        const negativeClass = styles.negative;
        if (value === 0) {
            this.eGui.classList.remove(negativeClass);
            this.eGui.classList.remove(positiveClass);
        } else if (value > 0) {
            this.eGui.classList.remove(negativeClass);
            this.eGui.classList.add(positiveClass);
        } else {
            this.eGui.classList.remove(positiveClass);
            this.eGui.classList.add(negativeClass);
        }

        this.eGui.innerHTML = toPercentage({ value, decimalPlaces: 2 });

        this.lastValue = value;

        return true;
    }
}
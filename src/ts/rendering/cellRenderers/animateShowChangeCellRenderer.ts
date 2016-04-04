import {ICellRenderer} from "./iCellRenderer";
import {Utils as _} from "../../utils";

var ARROW_UP = '&#65514;';
var ARROW_DOWN = '&#65516;';

export class AnimateShowChangeCellRenderer implements ICellRenderer {

    private params: any;
    private lastValue: number;
    private eValue: HTMLElement;
    private eDeltaValues: HTMLElement[] = [];

    public init(params: any): void {
        this.params = params;
        this.createValueSpan(params);
        this.refresh(params);
    }

    private createValueSpan(params: any): void {
        // this is the span we update with the current value, it is always visible
        this.eValue = document.createElement('span');
        _.addCssClass(this.eValue, 'ag-value-change-value');
        params.eParentOfValue.appendChild(this.eValue);
    }

    public showDelta(params: any, delta: number): void {
        var eSpan = document.createElement('span');
        _.addCssClass(eSpan, 'ag-value-change-delta');

        var valueFormatted = params.formatValue(Math.abs(delta));

        if (delta >= 0) {
            eSpan.innerHTML = ARROW_UP + valueFormatted;
            // class makes it green (in ag-fresh)
            _.addCssClass(eSpan, 'ag-value-change-delta-up');
        } else {
            // because negative, use ABS to remove sign
            eSpan.innerHTML = ARROW_DOWN + valueFormatted;
            // class makes it red (in ag-fresh)
            _.addCssClass(eSpan, 'ag-value-change-delta-down');
        }

        this.params.eParentOfValue.insertBefore(eSpan, this.eValue);

        this.eDeltaValues.push(eSpan);

        // highlight the current value
        _.addCssClass(this.eValue, 'ag-value-change-value-highlight');

        // add in timer, so we remove the delta value after 2 seconds
        setTimeout(this.removeDeltaValue.bind(this, eSpan), 2000);
    }

    public removeDeltaValue(eSpan: HTMLElement): void {
        this.params.eParentOfValue.removeChild(eSpan);
        this.eDeltaValues.splice(this.eDeltaValues.indexOf(eSpan), 1);
        if (this.eDeltaValues.length===0) {
            _.removeCssClass(this.eValue, 'ag-value-change-value-highlight');
        }
    }

    public refresh(params: any): void {
        var value = params.value;

        if (value === this.lastValue) {
            return;
        }

        if (_.exists(params.valueFormatted)) {
            this.eValue.innerHTML = params.valueFormatted;
        } else if (_.exists(params.value)) {
            this.eValue.innerHTML = value;
        } else {
            this.eValue.innerHTML = '';
        }

        if (typeof value === 'number' && typeof this.lastValue === 'number') {
            var delta = value - this.lastValue;
            this.showDelta(params, delta);
        }

        this.lastValue = value;
    }

    // returning null, as we want full control
    public getGui(): HTMLElement {
        return null;
    }
}

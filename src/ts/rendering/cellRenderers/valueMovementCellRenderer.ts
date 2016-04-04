
import {ICellRenderer} from "./iCellRenderer";
import {Utils as _} from "../../utils";

var ARROW_UP = '&#65514;';
var ARROW_DOWN = '&#65516;';
// var ARROW_UP = '&#x25B2;';
// var ARROW_DOWN = '&#x25BC;';

export class AnimateShowChangedCellRenderer implements ICellRenderer {

    private params: any;
    private lastValue: number;
    private eValue: HTMLElement;
    private eDeltaValues: HTMLElement[] = [];

    public init(params: any): void {
        this.params = params;
        this.createValueSpan(params);
        this.refresh(params.value);
    }

    private createValueSpan(params: any): void {
        // this is the span we update with the current value, it is always visible
        this.eValue = document.createElement('span');
        params.eParentOfValue.appendChild(this.eValue);
    }

    public showDelta(delta: number): void {
        var eSpan = document.createElement('span');

        if (delta >= 0) {
            eSpan.innerHTML = ARROW_UP + delta;
            // class makes it green (in ag-fresh)
            _.addCssClass(eSpan, 'ag-value-movement-up');
        } else {
            // because negative, use ABS to remove sign
            eSpan.innerHTML = ARROW_DOWN + Math.abs(delta);
            // class makes it red (in ag-fresh)
            _.addCssClass(eSpan, 'ag-value-movement-down');
        }

        // if other delta values, put this one at the start
        if (this.eDeltaValues.length > 0) {
            this.params.eParentOfValue.insertBefore(eSpan, this.eDeltaValues[0]);
        } else {
            // otherwise just add after the real value
            this.params.eParentOfValue.appendChild(eSpan);
        }
        
        this.eDeltaValues.push(eSpan);

        // highlight the current value
        _.addCssClass(this.eValue, 'ag-value-movement-changed');

        // add in timer, so we remove the delta value after 2 seconds
        setTimeout(this.removeDeltaValue.bind(this, eSpan), 2000);
    }

    public removeDeltaValue(eSpan: HTMLElement): void {
        this.params.eParentOfValue.removeChild(eSpan);
        this.eDeltaValues.splice(this.eDeltaValues.indexOf(eSpan), 1);
        if (this.eDeltaValues.length===0) {
            _.removeCssClass(this.eValue, 'ag-value-movement-changed');
        }
    }

    public refresh(value: any): void {

        if (_.exists(value)) {
            this.eValue.innerHTML = value.toString();
        } else {
            this.eValue.innerHTML = '';
        }

        if (typeof value === 'number' && typeof this.lastValue === 'number') {
            var delta = value - this.lastValue;
            this.showDelta(delta);
        }

        this.lastValue = value;
    }

    // returning null, as we want full control
    public getGui(): HTMLElement {
        return null;
    }
}

import {ICellRenderer} from "./iCellRenderer";
import {Utils as _} from "../../utils";
import {Component} from "../../widgets/component";

var ARROW_UP = '&#65514;';
var ARROW_DOWN = '&#65516;';

export class AnimateShowChangeCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE =
        '<span>' +
        '<span class="ag-value-change-delta"></span>' +
        '<span class="ag-value-change-value"></span>' +
        '</span>';

    private params: any;
    private lastValue: number;

    private eValue: HTMLElement;
    private eDelta: HTMLElement;

    private refreshCount = 0;

    constructor() {
        super(AnimateShowChangeCellRenderer.TEMPLATE);
    }

    public init(params: any): void {
        this.params = params;

        this.eValue = this.queryForHtmlElement('.ag-value-change-value');
        this.eDelta = this.queryForHtmlElement('.ag-value-change-delta');

        this.refresh(params);
    }

    private showDelta(params: any, delta: number): void {

        var absDelta = Math.abs(delta);
        var valueFormatted = params.formatValue(absDelta);

        var valueToUse = _.exists(valueFormatted) ? valueFormatted : absDelta;

        var deltaUp = (delta >= 0);

        if (deltaUp) {
            this.eDelta.innerHTML = ARROW_UP + valueToUse;
        } else {
            // because negative, use ABS to remove sign
            this.eDelta.innerHTML = ARROW_DOWN + valueToUse;
        }

        // class makes it green (in ag-fresh)
        _.addOrRemoveCssClass(this.eDelta, 'ag-value-change-delta-up', deltaUp);
        // class makes it red (in ag-fresh)
        _.addOrRemoveCssClass(this.eDelta, 'ag-value-change-delta-down', !deltaUp);
    }

    private setTimerToRemoveDelta(): void {
        // the refreshCount makes sure that if the value updates again while
        // the below timer is waiting, then the below timer will realise it
        // is not the most recent and will not try to remove the delta value.
        this.refreshCount++;
        var refreshCountCopy = this.refreshCount;
        setTimeout( ()=> {
            if (refreshCountCopy === this.refreshCount) {
                this.hideDeltaValue();
            }
        }, 2000);
    }

    private hideDeltaValue(): void {
        _.removeCssClass(this.eValue, 'ag-value-change-value-highlight');
        this.eDelta.innerHTML = '';
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

        // highlight the current value, but only if it's not new, otherwise it
        // would get highlighted first time the value is shown
        if (this.lastValue) {
            _.addCssClass(this.eValue, 'ag-value-change-value-highlight');
        }


        this.setTimerToRemoveDelta();

        this.lastValue = value;
    }
}

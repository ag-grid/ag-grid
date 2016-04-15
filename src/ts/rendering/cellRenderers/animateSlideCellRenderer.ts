
import {ICellRenderer} from "./iCellRenderer";
import {Utils as _} from "../../utils";
import {Component} from "../../widgets/component";

export class AnimateSlideCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE =
        '<span>' +
        '<span class="ag-value-slide-previous"></span>' +
        '<span class="ag-value-slide-current"></span>' +
        '</span>';

    private params: any;

    private eCurrent: HTMLElement;
    private ePrevious: HTMLElement;

    private lastValue: any;

    private refreshCount = 0;

    constructor() {
        super(AnimateSlideCellRenderer.TEMPLATE);

        this.eCurrent = this.queryForHtmlElement('.ag-value-slide-current');
        this.ePrevious = this.queryForHtmlElement('.ag-value-slide-previous');
    }

    public init(params: any): void {
        this.params = params;
        this.refresh(params);
    }

    public addSlideAnimation(): void {
        this.refreshCount++;

        // below we keep checking this, and stop working on the animation
        // if it no longer matches - this means another animation has started
        // and this one is stale.
        var refreshCountCopy = this.refreshCount;

        _.setVisible(this.ePrevious, true);

        // remove all the animation classes
        _.removeCssClass(this.ePrevious, 'ag-fade-out');
        _.removeCssClass(this.ePrevious, 'ag-fade-out-end');

        // having timeout of 0 allows use to skip to the next css turn,
        // so we know the previous css classes have been applied. so the
        // complex set of setTimeout below creates the animation
        setTimeout( ()=> {
            if (refreshCountCopy !== this.refreshCount) { return; }
            _.addCssClass(this.ePrevious, 'ag-fade-out');
            setTimeout( ()=> {
                if (refreshCountCopy !== this.refreshCount) { return; }
                _.addCssClass(this.ePrevious, 'ag-fade-out-end');
            }, 0);
        }, 0);

        setTimeout( ()=> {
            if (refreshCountCopy !== this.refreshCount) { return; }
            _.setVisible(this.ePrevious, false);
        }, 3000);
    }

    public refresh(params: any): void {

        var value = params.value;

        if (_.missing(value)) {
            value = '';
        }

        if (value === this.lastValue) {
            return;
        }

        this.ePrevious.innerHTML = this.eCurrent.innerHTML;

        this.lastValue = value;

        if (_.exists(params.valueFormatted)) {
            this.eCurrent.innerHTML = params.valueFormatted;
        } else if (_.exists(params.value)) {
            this.eCurrent.innerHTML = value;
        } else {
            this.eCurrent.innerHTML = '';
        }

        this.addSlideAnimation();
    }
}

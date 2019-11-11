
import { ICellRenderer } from "./iCellRenderer";
import { Component } from "../../widgets/component";
import { _ } from "../../utils";
import { Autowired } from "../../context/context";
import { FilterManager } from "../../filter/filterManager";

export class AnimateSlideCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE =
        '<span>' +
        '<span class="ag-value-slide-current"></span>' +
        '</span>';

    private params: any;

    private eCurrent: HTMLElement;
    private ePrevious: HTMLElement;

    private lastValue: any;

    private refreshCount = 0;

    @Autowired('filterManager') private filterManager: FilterManager;

    constructor() {
        super(AnimateSlideCellRenderer.TEMPLATE);

        this.eCurrent = this.queryForHtmlElement('.ag-value-slide-current');
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
        const refreshCountCopy = this.refreshCount;

        // if old animation, remove it
        if (this.ePrevious) {
            this.getGui().removeChild(this.ePrevious);
        }

        this.ePrevious = _.loadTemplate('<span class="ag-value-slide-previous ag-value-slide-out"></span>');
        this.ePrevious.innerHTML = this.eCurrent.innerHTML;
        this.getGui().insertBefore(this.ePrevious, this.eCurrent);

        // having timeout of 0 allows use to skip to the next css turn,
        // so we know the previous css classes have been applied. so the
        // complex set of setTimeout below creates the animation
        window.setTimeout(() => {
            if (refreshCountCopy !== this.refreshCount) { return; }
            _.addCssClass(this.ePrevious, 'ag-value-slide-out-end');
        }, 50);

        window.setTimeout(() => {
            if (refreshCountCopy !== this.refreshCount) { return; }
            this.getGui().removeChild(this.ePrevious);
            this.ePrevious = null;
        }, 3000);
    }

    public refresh(params: any): boolean {

        let value = params.value;

        if (_.missing(value)) {
            value = '';
        }

        if (value === this.lastValue) {
            return;
        }

        // we don't show the delta if we are in the middle of a filter. see comment on FilterManager
        // with regards processingFilterChange
        if (this.filterManager.isSuppressFlashingCellsBecauseFiltering()) {
            return;
        }

        this.addSlideAnimation();

        this.lastValue = value;

        if (_.exists(params.valueFormatted)) {
            this.eCurrent.innerHTML = params.valueFormatted;
        } else if (_.exists(params.value)) {
            this.eCurrent.innerHTML = value;
        } else {
            _.clearElement(this.eCurrent);
        }

        return true;
    }
}

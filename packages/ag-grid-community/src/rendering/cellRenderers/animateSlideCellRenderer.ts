import type { ElementParams } from '../../utils/dom';
import { _clearElement, _createElement } from '../../utils/dom';
import { _exists, _missing } from '../../utils/generic';
import { Component, RefPlaceholder } from '../../widgets/component';
import { animateSlideCellRendererCSS } from './animateSlideCellRenderer.css-GENERATED';
import type { ICellRenderer } from './iCellRenderer';

const AnimateSlideCellRendererElement: ElementParams = {
    tag: 'span',
    children: [{ tag: 'span', ref: 'eCurrent', cls: 'ag-value-slide-current' }],
};

export class AnimateSlideCellRenderer extends Component implements ICellRenderer {
    private eCurrent: HTMLElement = RefPlaceholder;
    private ePrevious: HTMLElement | null;

    private lastValue: any;

    private refreshCount = 0;

    constructor() {
        super(AnimateSlideCellRendererElement);

        this.registerCSS(animateSlideCellRendererCSS);
    }

    public init(params: any): void {
        this.refresh(params, true);
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

        const { beans, eCurrent } = this;
        const prevElement = _createElement({ tag: 'span', cls: 'ag-value-slide-previous ag-value-slide-out' });
        this.ePrevious = prevElement;

        prevElement.textContent = eCurrent.textContent;
        this.getGui().insertBefore(prevElement, eCurrent);

        // having timeout of 0 allows use to skip to the next css turn,
        // so we know the previous css classes have been applied. so the
        // complex set of setTimeout below creates the animation
        beans.frameworkOverrides.wrapIncoming(() => {
            window.setTimeout(() => {
                if (refreshCountCopy !== this.refreshCount) {
                    return;
                }
                this.ePrevious!.classList.add('ag-value-slide-out-end');
            }, 50);

            window.setTimeout(() => {
                if (refreshCountCopy !== this.refreshCount) {
                    return;
                }
                this.getGui().removeChild(this.ePrevious!);
                this.ePrevious = null;
            }, 3000);
        });
    }

    public refresh(params: any, isInitialRender: boolean = false): boolean {
        let value = params.value;

        if (_missing(value)) {
            value = '';
        }

        if (value === this.lastValue) {
            return false;
        }

        // we don't show the delta if we are in the middle of a filter. see comment on FilterManager
        // with regards processingFilterChange
        if (this.beans.filterManager?.isSuppressFlashingCellsBecauseFiltering()) {
            return false;
        }

        if (!isInitialRender) {
            this.addSlideAnimation();
        }

        this.lastValue = value;

        const eCurrent = this.eCurrent;
        if (_exists(params.valueFormatted)) {
            eCurrent.textContent = params.valueFormatted;
        } else if (_exists(params.value)) {
            eCurrent.textContent = value;
        } else {
            _clearElement(eCurrent);
        }

        return true;
    }
}

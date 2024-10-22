import type { BeanCollection } from '../../context/context';
import type { FilterManager } from '../../filter/filterManager';
import { _clearElement } from '../../utils/dom';
import { _exists, _missing } from '../../utils/generic';
import { Component } from '../../widgets/component';
import type { ICellRenderer } from './iCellRenderer';

export class AnimateSlideCellRenderer extends Component implements ICellRenderer {
    private eCurrent: HTMLElement;
    private ePrevious: HTMLElement | null;

    private lastValue: any;

    private refreshCount = 0;

    private filterManager?: FilterManager;

    public wireBeans(beans: BeanCollection): void {
        this.filterManager = beans.filterManager;
    }

    constructor() {
        super();

        const template = document.createElement('span');
        const slide = document.createElement('span');
        slide.setAttribute('class', 'ag-value-slide-current');
        template.appendChild(slide);

        this.setTemplateFromElement(template);

        this.eCurrent = this.queryForHtmlElement('.ag-value-slide-current');
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

        const prevElement = document.createElement('span');
        prevElement.setAttribute('class', 'ag-value-slide-previous ag-value-slide-out');
        this.ePrevious = prevElement;

        this.ePrevious.textContent = this.eCurrent.textContent;
        this.getGui().insertBefore(this.ePrevious, this.eCurrent);

        // having timeout of 0 allows use to skip to the next css turn,
        // so we know the previous css classes have been applied. so the
        // complex set of setTimeout below creates the animation
        this.beans.frameworkOverrides.wrapIncoming(() => {
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
        if (this.filterManager?.isSuppressFlashingCellsBecauseFiltering()) {
            return false;
        }

        if (!isInitialRender) {
            this.addSlideAnimation();
        }

        this.lastValue = value;

        if (_exists(params.valueFormatted)) {
            this.eCurrent.textContent = params.valueFormatted;
        } else if (_exists(params.value)) {
            this.eCurrent.textContent = value;
        } else {
            _clearElement(this.eCurrent);
        }

        return true;
    }
}

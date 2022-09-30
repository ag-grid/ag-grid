/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../../context/context");
const component_1 = require("../../widgets/component");
const dom_1 = require("../../utils/dom");
const generic_1 = require("../../utils/generic");
class AnimateSlideCellRenderer extends component_1.Component {
    constructor() {
        super(AnimateSlideCellRenderer.TEMPLATE);
        this.refreshCount = 0;
        this.eCurrent = this.queryForHtmlElement('.ag-value-slide-current');
    }
    init(params) {
        this.refresh(params);
    }
    addSlideAnimation() {
        this.refreshCount++;
        // below we keep checking this, and stop working on the animation
        // if it no longer matches - this means another animation has started
        // and this one is stale.
        const refreshCountCopy = this.refreshCount;
        // if old animation, remove it
        if (this.ePrevious) {
            this.getGui().removeChild(this.ePrevious);
        }
        this.ePrevious = dom_1.loadTemplate('<span class="ag-value-slide-previous ag-value-slide-out"></span>');
        this.ePrevious.innerHTML = this.eCurrent.innerHTML;
        this.getGui().insertBefore(this.ePrevious, this.eCurrent);
        // having timeout of 0 allows use to skip to the next css turn,
        // so we know the previous css classes have been applied. so the
        // complex set of setTimeout below creates the animation
        window.setTimeout(() => {
            if (refreshCountCopy !== this.refreshCount) {
                return;
            }
            this.ePrevious.classList.add('ag-value-slide-out-end');
        }, 50);
        window.setTimeout(() => {
            if (refreshCountCopy !== this.refreshCount) {
                return;
            }
            this.getGui().removeChild(this.ePrevious);
            this.ePrevious = null;
        }, 3000);
    }
    refresh(params) {
        let value = params.value;
        if (generic_1.missing(value)) {
            value = '';
        }
        if (value === this.lastValue) {
            return false;
        }
        // we don't show the delta if we are in the middle of a filter. see comment on FilterManager
        // with regards processingFilterChange
        if (this.filterManager.isSuppressFlashingCellsBecauseFiltering()) {
            return false;
        }
        this.addSlideAnimation();
        this.lastValue = value;
        if (generic_1.exists(params.valueFormatted)) {
            this.eCurrent.innerHTML = params.valueFormatted;
        }
        else if (generic_1.exists(params.value)) {
            this.eCurrent.innerHTML = value;
        }
        else {
            dom_1.clearElement(this.eCurrent);
        }
        return true;
    }
}
AnimateSlideCellRenderer.TEMPLATE = `<span>
            <span class="ag-value-slide-current"></span>
        </span>`;
__decorate([
    context_1.Autowired('filterManager')
], AnimateSlideCellRenderer.prototype, "filterManager", void 0);
exports.AnimateSlideCellRenderer = AnimateSlideCellRenderer;

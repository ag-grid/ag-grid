/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { createIconNoSpan } from "../../utils/icon";
export class LoadingCellRenderer extends Component {
    constructor() {
        super(LoadingCellRenderer.TEMPLATE);
    }
    init(params) {
        params.node.failedLoad ? this.setupFailed() : this.setupLoading();
    }
    setupFailed() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eLoadingText.innerText = localeTextFunc('loadingError', 'ERR');
    }
    setupLoading() {
        const eLoadingIcon = createIconNoSpan('groupLoading', this.gridOptionsService, null);
        if (eLoadingIcon) {
            this.eLoadingIcon.appendChild(eLoadingIcon);
        }
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eLoadingText.innerText = localeTextFunc('loadingOoo', 'Loading');
    }
    refresh(params) {
        return false;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
}
LoadingCellRenderer.TEMPLATE = `<div class="ag-loading">
            <span class="ag-loading-icon" ref="eLoadingIcon"></span>
            <span class="ag-loading-text" ref="eLoadingText"></span>
        </div>`;
__decorate([
    RefSelector('eLoadingIcon')
], LoadingCellRenderer.prototype, "eLoadingIcon", void 0);
__decorate([
    RefSelector('eLoadingText')
], LoadingCellRenderer.prototype, "eLoadingText", void 0);

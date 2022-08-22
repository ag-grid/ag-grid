/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
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
const component_1 = require("../../widgets/component");
const componentAnnotations_1 = require("../../widgets/componentAnnotations");
const icon_1 = require("../../utils/icon");
class LoadingCellRenderer extends component_1.Component {
    constructor() {
        super(LoadingCellRenderer.TEMPLATE);
    }
    init(params) {
        params.node.failedLoad ? this.setupFailed() : this.setupLoading();
    }
    setupFailed() {
        this.eLoadingText.innerText = 'ERR';
    }
    setupLoading() {
        const eLoadingIcon = icon_1.createIconNoSpan('groupLoading', this.gridOptionsWrapper, null);
        if (eLoadingIcon) {
            this.eLoadingIcon.appendChild(eLoadingIcon);
        }
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
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
    componentAnnotations_1.RefSelector('eLoadingIcon')
], LoadingCellRenderer.prototype, "eLoadingIcon", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eLoadingText')
], LoadingCellRenderer.prototype, "eLoadingText", void 0);
exports.LoadingCellRenderer = LoadingCellRenderer;

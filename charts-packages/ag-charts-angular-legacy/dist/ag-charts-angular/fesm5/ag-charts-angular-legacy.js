import { __assign } from 'tslib';
import { Component, ViewEncapsulation, ElementRef, Input, NgModule } from '@angular/core';
import { AgChart } from 'ag-charts-community';

/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// noinspection AngularIncorrectTemplateDefinition
var AgChartsAngular = /** @class */ (function () {
    function AgChartsAngular(elementDef) {
        this._initialised = false;
        this._destroyed = false;
        this._nativeElement = elementDef.nativeElement;
    }
    /**
     * @return {?}
     */
    AgChartsAngular.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var options = this.applyContainerIfNotSet(this.options);
        this._chart = AgChart.create(options);
        this._initialised = true;
    };
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    /**
     * @param {?} changes
     * @return {?}
     */
    AgChartsAngular.prototype.ngOnChanges = 
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (this._initialised) {
            AgChart.update(this._chart, this.applyContainerIfNotSet(this.options));
        }
    };
    /**
     * @return {?}
     */
    AgChartsAngular.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        if (this._initialised) {
            if (this._chart) {
                this._chart.destroy();
            }
            this._destroyed = true;
        }
    };
    /**
     * @private
     * @param {?} propsOptions
     * @return {?}
     */
    AgChartsAngular.prototype.applyContainerIfNotSet = /**
     * @private
     * @param {?} propsOptions
     * @return {?}
     */
    function (propsOptions) {
        if (propsOptions.container) {
            return propsOptions;
        }
        return __assign(__assign({}, propsOptions), { container: this._nativeElement });
    };
    AgChartsAngular.decorators = [
        { type: Component, args: [{
                    selector: 'ag-charts-angular',
                    template: '',
                    encapsulation: ViewEncapsulation.None
                }] }
    ];
    /** @nocollapse */
    AgChartsAngular.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    AgChartsAngular.propDecorators = {
        options: [{ type: Input }]
    };
    return AgChartsAngular;
}());
if (false) {
    /**
     * @type {?}
     * @private
     */
    AgChartsAngular.prototype._nativeElement;
    /**
     * @type {?}
     * @private
     */
    AgChartsAngular.prototype._initialised;
    /**
     * @type {?}
     * @private
     */
    AgChartsAngular.prototype._destroyed;
    /**
     * @type {?}
     * @private
     */
    AgChartsAngular.prototype._chart;
    /** @type {?} */
    AgChartsAngular.prototype.options;
}

/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
var AgChartsAngularModule = /** @class */ (function () {
    function AgChartsAngularModule() {
    }
    AgChartsAngularModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [AgChartsAngular],
                    imports: [],
                    exports: [AgChartsAngular]
                },] }
    ];
    return AgChartsAngularModule;
}());

/**
 * @fileoverview added by tsickle
 * Generated from: public-api.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * Generated from: ag-charts-angular-legacy.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { AgChartsAngular, AgChartsAngularModule };
//# sourceMappingURL=ag-charts-angular-legacy.js.map

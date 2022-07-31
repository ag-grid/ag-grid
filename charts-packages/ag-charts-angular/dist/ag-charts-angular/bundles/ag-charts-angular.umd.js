(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('ag-charts-community')) :
    typeof define === 'function' && define.amd ? define('ag-charts-angular', ['exports', '@angular/core', 'ag-charts-community'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["ag-charts-angular"] = {}, global.ng.core, global.agCharts));
})(this, (function (exports, i0, agChartsCommunity) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);

    // noinspection AngularIncorrectTemplateDefinition
    var AgChartsAngular = /** @class */ (function () {
        function AgChartsAngular(elementDef) {
            this._initialised = false;
            this._destroyed = false;
            this._nativeElement = elementDef.nativeElement;
        }
        AgChartsAngular.prototype.ngAfterViewInit = function () {
            var options = this.applyContainerIfNotSet(this.options);
            this._chart = agChartsCommunity.AgChart.create(options);
            this._initialised = true;
        };
        // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
        AgChartsAngular.prototype.ngOnChanges = function (changes) {
            if (this._initialised) {
                agChartsCommunity.AgChart.update(this._chart, this.applyContainerIfNotSet(this.options));
            }
        };
        AgChartsAngular.prototype.ngOnDestroy = function () {
            if (this._initialised) {
                if (this._chart) {
                    this._chart.destroy();
                }
                this._destroyed = true;
            }
        };
        AgChartsAngular.prototype.applyContainerIfNotSet = function (propsOptions) {
            if (propsOptions.container) {
                return propsOptions;
            }
            return Object.assign(Object.assign({}, propsOptions), { container: this._nativeElement });
        };
        return AgChartsAngular;
    }());
    AgChartsAngular.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.16", ngImport: i0__namespace, type: AgChartsAngular, deps: [{ token: i0__namespace.ElementRef }], target: i0__namespace.ɵɵFactoryTarget.Component });
    AgChartsAngular.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.16", type: AgChartsAngular, selector: "ag-charts-angular", inputs: { options: "options" }, usesOnChanges: true, ngImport: i0__namespace, template: '', isInline: true, encapsulation: i0__namespace.ViewEncapsulation.None });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.16", ngImport: i0__namespace, type: AgChartsAngular, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'ag-charts-angular',
                        template: '',
                        encapsulation: i0.ViewEncapsulation.None
                    }]
            }], ctorParameters: function () { return [{ type: i0__namespace.ElementRef }]; }, propDecorators: { options: [{
                    type: i0.Input
                }] } });

    var AgChartsAngularModule = /** @class */ (function () {
        function AgChartsAngularModule() {
        }
        return AgChartsAngularModule;
    }());
    AgChartsAngularModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.16", ngImport: i0__namespace, type: AgChartsAngularModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AgChartsAngularModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.2.16", ngImport: i0__namespace, type: AgChartsAngularModule, declarations: [AgChartsAngular], exports: [AgChartsAngular] });
    AgChartsAngularModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.2.16", ngImport: i0__namespace, type: AgChartsAngularModule, imports: [[]] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.16", ngImport: i0__namespace, type: AgChartsAngularModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        declarations: [AgChartsAngular],
                        imports: [],
                        exports: [AgChartsAngular]
                    }]
            }] });

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AgChartsAngular = AgChartsAngular;
    exports.AgChartsAngularModule = AgChartsAngularModule;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=ag-charts-angular.umd.js.map

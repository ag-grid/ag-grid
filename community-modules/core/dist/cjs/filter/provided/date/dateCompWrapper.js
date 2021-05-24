/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Provides sync access to async component. Date component can be lazy created - this class encapsulates
 * this by keeping value locally until DateComp has loaded, then passing DateComp the value. */
var DateCompWrapper = /** @class */ (function () {
    function DateCompWrapper(context, userComponentFactory, dateComponentParams, eParent) {
        var _this = this;
        this.alive = true;
        this.context = context;
        userComponentFactory.newDateComponent(dateComponentParams).then(function (dateComp) {
            // because async, check the filter still exists after component comes back
            if (!_this.alive) {
                context.destroyBean(dateComp);
                return;
            }
            _this.dateComp = dateComp;
            if (!dateComp) {
                return;
            }
            eParent.appendChild(dateComp.getGui());
            if (dateComp.afterGuiAttached) {
                dateComp.afterGuiAttached();
            }
            if (_this.tempValue) {
                dateComp.setDate(_this.tempValue);
            }
        });
    }
    DateCompWrapper.prototype.destroy = function () {
        this.alive = false;
        this.dateComp = this.context.destroyBean(this.dateComp);
    };
    DateCompWrapper.prototype.getDate = function () {
        return this.dateComp ? this.dateComp.getDate() : this.tempValue;
    };
    DateCompWrapper.prototype.setDate = function (value) {
        if (this.dateComp) {
            this.dateComp.setDate(value);
        }
        else {
            this.tempValue = value;
        }
    };
    DateCompWrapper.prototype.setInputPlaceholder = function (placeholder) {
        if (this.dateComp && this.dateComp.setInputPlaceholder) {
            this.dateComp.setInputPlaceholder(placeholder);
        }
    };
    DateCompWrapper.prototype.setInputAriaLabel = function (label) {
        if (this.dateComp && this.dateComp.setInputAriaLabel) {
            this.dateComp.setInputAriaLabel(label);
        }
    };
    DateCompWrapper.prototype.afterGuiAttached = function (params) {
        if (this.dateComp && typeof this.dateComp.afterGuiAttached === 'function') {
            this.dateComp.afterGuiAttached(params);
        }
    };
    return DateCompWrapper;
}());
exports.DateCompWrapper = DateCompWrapper;

//# sourceMappingURL=dateCompWrapper.js.map

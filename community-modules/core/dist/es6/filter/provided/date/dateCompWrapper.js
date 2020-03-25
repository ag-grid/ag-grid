/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
/** Provides sync access to async component. Date component can be lazy created - this class encapsulates
 * this by keeping value locally until DateComp has loaded, then passing DateComp the value. */
var DateCompWrapper = /** @class */ (function () {
    function DateCompWrapper(userComponentFactory, dateComponentParams, eParent) {
        var _this = this;
        this.alive = true;
        userComponentFactory.newDateComponent(dateComponentParams).then(function (dateComp) {
            // because async, check the filter still exists after component comes back
            if (!_this.alive) {
                if (dateComp.destroy) {
                    dateComp.destroy();
                }
                return;
            }
            _this.dateComp = dateComp;
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
        if (this.dateComp && this.dateComp.destroy) {
            this.dateComp.destroy();
        }
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
    return DateCompWrapper;
}());
export { DateCompWrapper };

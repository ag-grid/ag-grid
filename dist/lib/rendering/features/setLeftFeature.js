/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require("../../utils");
var column_1 = require("../../entities/column");
var SetLeftFeature = (function () {
    function SetLeftFeature(columnOrGroup, eCell) {
        this.destroyFunctions = [];
        this.columnOrGroup = columnOrGroup;
        this.eCell = eCell;
        this.init();
    }
    SetLeftFeature.prototype.init = function () {
        var _this = this;
        var listener = this.onLeftChanged.bind(this);
        this.columnOrGroup.addEventListener(column_1.Column.EVENT_LEFT_CHANGED, listener);
        this.destroyFunctions.push(function () {
            _this.columnOrGroup.removeEventListener(column_1.Column.EVENT_LEFT_CHANGED, listener);
        });
        this.onLeftChanged();
    };
    SetLeftFeature.prototype.onLeftChanged = function () {
        var newLeft = this.columnOrGroup.getLeft();
        if (utils_1.Utils.exists(newLeft)) {
            this.eCell.style.left = this.columnOrGroup.getLeft() + 'px';
        }
        else {
            this.eCell.style.left = '';
        }
    };
    SetLeftFeature.prototype.destroy = function () {
        this.destroyFunctions.forEach(function (func) {
            func();
        });
    };
    return SetLeftFeature;
})();
exports.SetLeftFeature = SetLeftFeature;

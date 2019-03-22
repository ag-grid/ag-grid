// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../scene/group");
var Series = /** @class */ (function () {
    function Series() {
        this.id = this.createId();
        this._chart = null;
        this.group = new group_1.Group();
        this._visible = true;
    }
    // Uniquely identify series.
    Series.prototype.createId = function () {
        var constructor = this.constructor;
        return constructor.name + '-' + (constructor.id = (constructor.id || 0) + 1);
    };
    ;
    Object.defineProperty(Series.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (value) {
            if (this._visible !== value) {
                this._visible = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    return Series;
}());
exports.Series = Series;

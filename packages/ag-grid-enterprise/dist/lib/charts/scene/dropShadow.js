// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DropShadow = /** @class */ (function () {
    function DropShadow(options) {
        this._enabled = true;
        this._enabled = options.enabled !== undefined ? options.enabled : true;
        this._color = options.color !== undefined ? options.color : 'black';
        this._xOffset = options.xOffset !== undefined ? options.xOffset : 0;
        this._yOffset = options.yOffset !== undefined ? options.yOffset : 0;
        this._blur = options.blur !== undefined ? options.blur : 0;
    }
    Object.defineProperty(DropShadow.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            if (this._enabled !== value) {
                this._enabled = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DropShadow.prototype, "color", {
        get: function () {
            return this._color;
        },
        set: function (value) {
            if (this._color !== value) {
                this._color = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DropShadow.prototype, "xOffset", {
        get: function () {
            return this._xOffset;
        },
        set: function (value) {
            if (this._xOffset !== value) {
                this._xOffset = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DropShadow.prototype, "yOffset", {
        get: function () {
            return this._yOffset;
        },
        set: function (value) {
            if (this._yOffset !== value) {
                this._yOffset = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DropShadow.prototype, "blur", {
        get: function () {
            return this._blur;
        },
        set: function (value) {
            if (this._blur !== value) {
                this._blur = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    DropShadow.prototype.update = function () {
        if (this.onChange) {
            this.onChange();
        }
    };
    return DropShadow;
}());
exports.DropShadow = DropShadow;

var Label = /** @class */ (function () {
    function Label() {
        this._enabled = true;
        this._fontSize = 12;
        this._fontFamily = 'Verdana, sans-serif';
        this._color = 'black';
    }
    Object.defineProperty(Label.prototype, "enabled", {
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
    Object.defineProperty(Label.prototype, "fontStyle", {
        get: function () {
            return this._fontStyle;
        },
        set: function (value) {
            if (this._fontStyle !== value) {
                this._fontStyle = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "fontWeight", {
        get: function () {
            return this._fontWeight;
        },
        set: function (value) {
            if (this._fontWeight !== value) {
                this._fontWeight = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "fontSize", {
        get: function () {
            return this._fontSize;
        },
        set: function (value) {
            if (this._fontSize !== value) {
                this._fontSize = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "fontFamily", {
        get: function () {
            return this._fontFamily;
        },
        set: function (value) {
            if (this._fontFamily !== value) {
                this._fontFamily = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "color", {
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
    Label.prototype.update = function () {
        if (this.onChange) {
            this.onChange();
        }
    };
    return Label;
}());
export { Label };

// ag-grid-enterprise v21.2.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var shape_1 = require("./shape");
var path2D_1 = require("../path2D");
var angle_1 = require("../../util/angle");
var number_1 = require("../../util/number");
var bbox_1 = require("../bbox");
var Sector = /** @class */ (function (_super) {
    __extends(Sector, _super);
    function Sector() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.path = new path2D_1.Path2D();
        _this._dirtyPath = true;
        _this._centerX = 0;
        _this._centerY = 0;
        _this._centerOffset = 0;
        _this._innerRadius = 10;
        _this._outerRadius = 20;
        _this._startAngle = 0;
        _this._endAngle = Math.PI * 2;
        _this._angleOffset = 0;
        _this.getBBox = function () {
            var radius = _this.outerRadius;
            return new bbox_1.BBox(_this.centerX - radius, _this.centerY - radius, radius * 2, radius * 2);
        };
        return _this;
    }
    Sector.create = function (centerX, centerY, innerRadius, outerRadius, startAngle, endAngle) {
        if (startAngle === void 0) { startAngle = 0; }
        if (endAngle === void 0) { endAngle = Math.PI * 2; }
        var sector = new Sector();
        sector.centerX = centerX;
        sector.centerY = centerY;
        sector.innerRadius = innerRadius;
        sector.outerRadius = outerRadius;
        sector.startAngle = startAngle;
        sector.endAngle = endAngle;
        return sector;
    };
    Object.defineProperty(Sector.prototype, "dirtyPath", {
        get: function () {
            return this._dirtyPath;
        },
        set: function (value) {
            if (this._dirtyPath !== value) {
                this._dirtyPath = value;
                if (value) {
                    this.dirty = true;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "centerX", {
        get: function () {
            return this._centerX;
        },
        set: function (value) {
            if (this._centerX !== value) {
                this._centerX = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "centerY", {
        get: function () {
            return this._centerY;
        },
        set: function (value) {
            if (this._centerY !== value) {
                this._centerY = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "centerOffset", {
        get: function () {
            return this._centerOffset;
        },
        set: function (value) {
            if (this._centerOffset !== value) {
                this._centerOffset = Math.max(0, value);
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "innerRadius", {
        get: function () {
            return this._innerRadius;
        },
        set: function (value) {
            if (this._innerRadius !== value) {
                this._innerRadius = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "outerRadius", {
        get: function () {
            return this._outerRadius;
        },
        set: function (value) {
            if (this._outerRadius !== value) {
                this._outerRadius = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "startAngle", {
        get: function () {
            return this._startAngle;
        },
        set: function (value) {
            if (this._startAngle !== value) {
                this._startAngle = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "endAngle", {
        get: function () {
            return this._endAngle;
        },
        set: function (value) {
            if (this._endAngle !== value) {
                this._endAngle = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sector.prototype, "angleOffset", {
        get: function () {
            return this._angleOffset;
        },
        set: function (value) {
            if (this._angleOffset !== value) {
                this._angleOffset = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Sector.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        return this.path.isPointInPath(point.x, point.y);
    };
    Sector.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Object.defineProperty(Sector.prototype, "fullPie", {
        get: function () {
            return number_1.isEqual(angle_1.normalizeAngle360(this.startAngle), angle_1.normalizeAngle360(this.endAngle));
        },
        enumerable: true,
        configurable: true
    });
    Sector.prototype.updatePath = function () {
        if (!this.dirtyPath) {
            return;
        }
        var path = this.path;
        var angleOffset = this.angleOffset;
        var startAngle = Math.min(this.startAngle, this.endAngle) + angleOffset;
        var endAngle = Math.max(this.startAngle, this.endAngle) + angleOffset;
        var midAngle = (startAngle + endAngle) * 0.5;
        var innerRadius = Math.min(this.innerRadius, this.outerRadius);
        var outerRadius = Math.max(this.innerRadius, this.outerRadius);
        var centerOffset = this.centerOffset;
        var fullPie = this.fullPie;
        var radiiGap = outerRadius - innerRadius;
        // const tipOffset = radiiGap / 3;
        // const showTip = radiiGap < outerRadius / 2;
        var centerX = this.centerX;
        var centerY = this.centerY;
        path.clear();
        if (centerOffset) {
            centerX += centerOffset * Math.cos(midAngle);
            centerY += centerOffset * Math.sin(midAngle);
        }
        if (!fullPie) {
            path.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
            // if (showTip) {
            //     path.lineTo(
            //         centerX + 0.5 * (innerRadius + outerRadius) * Math.cos(startAngle) + tipOffset * Math.cos(startAngle + Math.PI / 2),
            //         centerY + 0.5 * (innerRadius + outerRadius) * Math.sin(startAngle) + tipOffset * Math.sin(startAngle + Math.PI / 2)
            //     );
            // }
            path.lineTo(centerX + outerRadius * Math.cos(startAngle), centerY + outerRadius * Math.sin(startAngle));
        }
        path.cubicArc(centerX, centerY, outerRadius, outerRadius, 0, startAngle, endAngle, 0);
        // path[fullPie ? 'moveTo' : 'lineTo'](
        //     centerX + innerRadius * Math.cos(endAngle),
        //     centerY + innerRadius * Math.sin(endAngle)
        // );
        if (fullPie) {
            path.moveTo(centerX + innerRadius * Math.cos(endAngle), centerY + innerRadius * Math.sin(endAngle));
        }
        else {
            // if (showTip) {
            //     path.lineTo(
            //         centerX + 0.5 * (innerRadius + outerRadius) * Math.cos(endAngle) + tipOffset * Math.cos(endAngle + Math.PI / 2),
            //         centerY + 0.5 * (innerRadius + outerRadius) * Math.sin(endAngle) + tipOffset * Math.sin(endAngle + Math.PI / 2)
            //     );
            // }
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            var x = centerX + innerRadius * Math.cos(endAngle);
            path.lineTo(Math.abs(x) < 1e-8 ? 0 : x, centerY + innerRadius * Math.sin(endAngle));
        }
        path.cubicArc(centerX, centerY, innerRadius, innerRadius, 0, endAngle, startAngle, 1);
        path.closePath();
        this.dirtyPath = false;
    };
    Sector.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        this.updatePath();
        this.scene.appendPath(this.path);
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Sector.className = 'Sector';
    return Sector;
}(shape_1.Shape));
exports.Sector = Sector;

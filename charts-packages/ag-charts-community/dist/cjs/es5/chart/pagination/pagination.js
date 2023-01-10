"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pagination = void 0;
var group_1 = require("../../scene/group");
var triangle_1 = require("../marker/triangle");
var text_1 = require("../../scene/shape/text");
var hdpiCanvas_1 = require("../../canvas/hdpiCanvas");
var util_1 = require("../marker/util");
var id_1 = require("../../util/id");
var chart_1 = require("../chart");
var validation_1 = require("../../util/validation");
var PaginationLabel = /** @class */ (function () {
    function PaginationLabel() {
        this.color = 'black';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
    }
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING)
    ], PaginationLabel.prototype, "color", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_STYLE)
    ], PaginationLabel.prototype, "fontStyle", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_WEIGHT)
    ], PaginationLabel.prototype, "fontWeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PaginationLabel.prototype, "fontSize", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], PaginationLabel.prototype, "fontFamily", void 0);
    return PaginationLabel;
}());
var PaginationMarkerStyle = /** @class */ (function () {
    function PaginationMarkerStyle() {
        this.size = 15;
        this.fillOpacity = undefined;
        this.strokeWidth = 1;
        this.strokeOpacity = 1;
    }
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PaginationMarkerStyle.prototype, "size", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], PaginationMarkerStyle.prototype, "fill", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0, 1))
    ], PaginationMarkerStyle.prototype, "fillOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], PaginationMarkerStyle.prototype, "stroke", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PaginationMarkerStyle.prototype, "strokeWidth", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], PaginationMarkerStyle.prototype, "strokeOpacity", void 0);
    return PaginationMarkerStyle;
}());
var PaginationMarker = /** @class */ (function () {
    function PaginationMarker() {
        this.size = 15;
        this._shape = triangle_1.Triangle;
        /**
         * Inner padding between a pagination button and the label.
         */
        this.padding = 8;
    }
    Object.defineProperty(PaginationMarker.prototype, "shape", {
        get: function () {
            return this._shape;
        },
        set: function (value) {
            var _a;
            this._shape = value;
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.onMarkerShapeChange();
        },
        enumerable: false,
        configurable: true
    });
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PaginationMarker.prototype, "size", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PaginationMarker.prototype, "padding", void 0);
    return PaginationMarker;
}());
var Pagination = /** @class */ (function () {
    function Pagination(chartUpdateCallback, pageUpdateCallback, interactionManager, cursorManager) {
        var _this = this;
        this.chartUpdateCallback = chartUpdateCallback;
        this.pageUpdateCallback = pageUpdateCallback;
        this.interactionManager = interactionManager;
        this.cursorManager = cursorManager;
        this.id = id_1.createId(this);
        this.group = new group_1.Group({ name: 'pagination' });
        this.labelNode = new text_1.Text();
        this.marker = new PaginationMarker();
        this.activeStyle = new PaginationMarkerStyle();
        this.inactiveStyle = new PaginationMarkerStyle();
        this.highlightStyle = new PaginationMarkerStyle();
        this.label = new PaginationLabel();
        this.nextButtonDisabled = false;
        this.previousButtonDisabled = false;
        this._totalPages = 0;
        this._currentPage = 0;
        this._visible = true;
        this._enabled = true;
        this._orientation = 'vertical';
        this._nextButton = new triangle_1.Triangle();
        this._previousButton = new triangle_1.Triangle();
        var labelNode = this.labelNode;
        labelNode.textBaseline = 'middle';
        labelNode.fontSize = 12;
        labelNode.fontFamily = 'Verdana, sans-serif';
        labelNode.fill = 'black';
        labelNode.y = hdpiCanvas_1.HdpiCanvas.has.textMetrics ? 1 : 0;
        this.group.append([this.nextButton, this.previousButton, labelNode]);
        this.interactionManager.addListener('click', function (event) { return _this.onPaginationClick(event); });
        this.interactionManager.addListener('hover', function (event) { return _this.onPaginationMouseMove(event); });
        this.marker.parent = this;
        this.update();
    }
    Object.defineProperty(Pagination.prototype, "totalPages", {
        get: function () {
            return this._totalPages;
        },
        set: function (value) {
            if (this._totalPages !== value) {
                this._totalPages = value;
                this.update();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pagination.prototype, "currentPage", {
        get: function () {
            return this._currentPage;
        },
        set: function (value) {
            if (this._currentPage !== value) {
                this._currentPage = value;
                this.update();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pagination.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (value) {
            this._visible = value;
            this.updateGroupVisibility();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pagination.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            this._enabled = value;
            this.updateGroupVisibility();
        },
        enumerable: false,
        configurable: true
    });
    Pagination.prototype.updateGroupVisibility = function () {
        this.group.visible = this.enabled && this.visible;
    };
    Object.defineProperty(Pagination.prototype, "orientation", {
        get: function () {
            return this._orientation;
        },
        set: function (value) {
            this._orientation = value;
            switch (value) {
                case 'horizontal': {
                    this.previousButton.rotation = -Math.PI / 2;
                    this.nextButton.rotation = Math.PI / 2;
                    break;
                }
                case 'vertical':
                default: {
                    this.previousButton.rotation = 0;
                    this.nextButton.rotation = Math.PI;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pagination.prototype, "translationX", {
        get: function () {
            return this.group.translationX;
        },
        set: function (value) {
            this.group.translationX = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pagination.prototype, "translationY", {
        get: function () {
            return this.group.translationY;
        },
        set: function (value) {
            this.group.translationY = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pagination.prototype, "nextButton", {
        get: function () {
            return this._nextButton;
        },
        set: function (value) {
            if (this._nextButton !== value) {
                this.group.removeChild(this._nextButton);
                this._nextButton = value;
                this.group.appendChild(value);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pagination.prototype, "previousButton", {
        get: function () {
            return this._previousButton;
        },
        set: function (value) {
            if (this._previousButton !== value) {
                this.group.removeChild(this._previousButton);
                this._previousButton = value;
                this.group.appendChild(value);
            }
        },
        enumerable: false,
        configurable: true
    });
    Pagination.prototype.update = function () {
        this.updateLabel();
        this.updatePositions();
        this.enableOrDisableButtons();
    };
    Pagination.prototype.updatePositions = function () {
        this.updateLabelPosition();
        this.updateNextButtonPosition();
    };
    Pagination.prototype.updateLabelPosition = function () {
        var _a = this.marker, markerSize = _a.size, markerPadding = _a.padding;
        this.nextButton.size = markerSize;
        this.previousButton.size = markerSize;
        this.labelNode.x = markerSize / 2 + markerPadding;
    };
    Pagination.prototype.updateNextButtonPosition = function () {
        var labelBBox = this.labelNode.computeBBox();
        this.nextButton.translationX = labelBBox.x + labelBBox.width + this.marker.size / 2 + this.marker.padding;
    };
    Pagination.prototype.updateLabel = function () {
        var _a = this, currentPage = _a.currentPage, pages = _a.totalPages, labelNode = _a.labelNode, _b = _a.label, color = _b.color, fontStyle = _b.fontStyle, fontWeight = _b.fontWeight, fontSize = _b.fontSize, fontFamily = _b.fontFamily;
        labelNode.text = currentPage + 1 + " / " + pages;
        labelNode.fill = color;
        labelNode.fontStyle = fontStyle;
        labelNode.fontWeight = fontWeight;
        labelNode.fontSize = fontSize;
        labelNode.fontFamily = fontFamily;
    };
    Pagination.prototype.updateMarkers = function () {
        var _a = this, nextButton = _a.nextButton, previousButton = _a.previousButton, nextButtonDisabled = _a.nextButtonDisabled, previousButtonDisabled = _a.previousButtonDisabled, activeStyle = _a.activeStyle, inactiveStyle = _a.inactiveStyle;
        var nextButtonStyle = nextButtonDisabled ? inactiveStyle : activeStyle;
        this.updateMarker(nextButton, nextButtonStyle);
        var previousButtonStyle = previousButtonDisabled ? inactiveStyle : activeStyle;
        this.updateMarker(previousButton, previousButtonStyle);
    };
    Pagination.prototype.updateMarker = function (marker, style) {
        var _a;
        var size = this.marker.size;
        marker.size = size;
        marker.fill = style.fill;
        marker.fillOpacity = (_a = style.fillOpacity) !== null && _a !== void 0 ? _a : 1;
        marker.stroke = style.stroke;
        marker.strokeWidth = style.strokeWidth;
        marker.strokeOpacity = style.strokeOpacity;
    };
    Pagination.prototype.enableOrDisableButtons = function () {
        var _a = this, currentPage = _a.currentPage, totalPages = _a.totalPages;
        var zeroPagesToDisplay = totalPages === 0;
        var onLastPage = currentPage === totalPages - 1;
        var onFirstPage = currentPage === 0;
        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        this.previousButtonDisabled = onFirstPage || zeroPagesToDisplay;
        this.updateMarkers();
    };
    Pagination.prototype.nextButtonContainsPoint = function (offsetX, offsetY) {
        return !this.nextButtonDisabled && this.nextButton.containsPoint(offsetX, offsetY);
    };
    Pagination.prototype.previousButtonContainsPoint = function (offsetX, offsetY) {
        return !this.previousButtonDisabled && this.previousButton.containsPoint(offsetX, offsetY);
    };
    Pagination.prototype.onPaginationClick = function (event) {
        var offsetX = event.offsetX, offsetY = event.offsetY;
        if (this.nextButtonContainsPoint(offsetX, offsetY)) {
            this.incrementPage();
            this.onPaginationChanged();
            event.consume();
        }
        else if (this.previousButtonContainsPoint(offsetX, offsetY)) {
            this.decrementPage();
            this.onPaginationChanged();
            event.consume();
        }
    };
    Pagination.prototype.onPaginationMouseMove = function (event) {
        var offsetX = event.offsetX, offsetY = event.offsetY;
        if (this.nextButtonContainsPoint(offsetX, offsetY)) {
            this.cursorManager.updateCursor(this.id, 'pointer');
            this.updateMarker(this.nextButton, this.highlightStyle);
        }
        else if (this.previousButtonContainsPoint(offsetX, offsetY)) {
            this.cursorManager.updateCursor(this.id, 'pointer');
            this.updateMarker(this.previousButton, this.highlightStyle);
        }
        else {
            this.updateMarkers();
            this.cursorManager.updateCursor(this.id);
        }
        this.chartUpdateCallback(chart_1.ChartUpdateType.SCENE_RENDER);
    };
    Pagination.prototype.onPaginationChanged = function () {
        this.update();
        this.pageUpdateCallback(this.currentPage);
    };
    Pagination.prototype.incrementPage = function () {
        this.currentPage = Math.min(this.currentPage + 1, this.totalPages - 1);
    };
    Pagination.prototype.decrementPage = function () {
        this.currentPage = Math.max(this.currentPage - 1, 0);
    };
    Pagination.prototype.onMarkerShapeChange = function () {
        var Marker = util_1.getMarker(this.marker.shape || triangle_1.Triangle);
        this.previousButton = new Marker();
        this.nextButton = new Marker();
        this.updatePositions();
        this.updateMarkers();
        this.chartUpdateCallback(chart_1.ChartUpdateType.SCENE_RENDER);
    };
    Pagination.prototype.attachPagination = function (node) {
        node.append(this.group);
    };
    Pagination.prototype.computeBBox = function () {
        return this.group.computeBBox();
    };
    Pagination.className = 'Pagination';
    return Pagination;
}());
exports.Pagination = Pagination;

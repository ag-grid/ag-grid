var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Group } from '../../scene/group';
import { Triangle } from '../marker/triangle';
import { Text } from '../../scene/shape/text';
import { HdpiCanvas } from '../../canvas/hdpiCanvas';
import { getMarker } from '../marker/util';
import { createId } from '../../util/id';
import { ChartUpdateType } from '../chartUpdateType';
import { COLOR_STRING, NUMBER, OPT_COLOR_STRING, OPT_FONT_STYLE, OPT_FONT_WEIGHT, OPT_NUMBER, STRING, Validate, } from '../../util/validation';
var PaginationLabel = /** @class */ (function () {
    function PaginationLabel() {
        this.color = 'black';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
    }
    __decorate([
        Validate(COLOR_STRING)
    ], PaginationLabel.prototype, "color", void 0);
    __decorate([
        Validate(OPT_FONT_STYLE)
    ], PaginationLabel.prototype, "fontStyle", void 0);
    __decorate([
        Validate(OPT_FONT_WEIGHT)
    ], PaginationLabel.prototype, "fontWeight", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], PaginationLabel.prototype, "fontSize", void 0);
    __decorate([
        Validate(STRING)
    ], PaginationLabel.prototype, "fontFamily", void 0);
    return PaginationLabel;
}());
var PaginationMarkerStyle = /** @class */ (function () {
    function PaginationMarkerStyle() {
        this.size = 15;
        this.fill = undefined;
        this.fillOpacity = undefined;
        this.stroke = undefined;
        this.strokeWidth = 1;
        this.strokeOpacity = 1;
    }
    __decorate([
        Validate(NUMBER(0))
    ], PaginationMarkerStyle.prototype, "size", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], PaginationMarkerStyle.prototype, "fill", void 0);
    __decorate([
        Validate(OPT_NUMBER(0, 1))
    ], PaginationMarkerStyle.prototype, "fillOpacity", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], PaginationMarkerStyle.prototype, "stroke", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], PaginationMarkerStyle.prototype, "strokeWidth", void 0);
    __decorate([
        Validate(NUMBER(0, 1))
    ], PaginationMarkerStyle.prototype, "strokeOpacity", void 0);
    return PaginationMarkerStyle;
}());
var PaginationMarker = /** @class */ (function () {
    function PaginationMarker() {
        this.size = 15;
        this._shape = Triangle;
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
        Validate(NUMBER(0))
    ], PaginationMarker.prototype, "size", void 0);
    __decorate([
        Validate(NUMBER(0))
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
        this.id = createId(this);
        this.group = new Group({ name: 'pagination' });
        this.labelNode = new Text();
        this.marker = new PaginationMarker();
        this.activeStyle = new PaginationMarkerStyle();
        this.inactiveStyle = new PaginationMarkerStyle();
        this.highlightStyle = new PaginationMarkerStyle();
        this.label = new PaginationLabel();
        this.totalPages = 0;
        this.currentPage = 0;
        this.translationX = 0;
        this.translationY = 0;
        this.nextButtonDisabled = false;
        this.previousButtonDisabled = false;
        this._visible = true;
        this._enabled = true;
        this._orientation = 'vertical';
        this._nextButton = new Triangle();
        this._previousButton = new Triangle();
        var labelNode = this.labelNode;
        labelNode.textBaseline = 'middle';
        labelNode.fontSize = 12;
        labelNode.fontFamily = 'Verdana, sans-serif';
        labelNode.fill = 'black';
        labelNode.y = HdpiCanvas.has.textMetrics ? 1 : 0;
        this.group.append([this.nextButton, this.previousButton, labelNode]);
        this.interactionManager.addListener('click', function (event) { return _this.onPaginationClick(event); });
        this.interactionManager.addListener('hover', function (event) { return _this.onPaginationMouseMove(event); });
        this.marker.parent = this;
        this.update();
        this.updateMarkers();
    }
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
        this.group.translationX = this.translationX;
        this.group.translationY = this.translationY;
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
        var _a = this, nextButton = _a.nextButton, previousButton = _a.previousButton, nextButtonDisabled = _a.nextButtonDisabled, previousButtonDisabled = _a.previousButtonDisabled, activeStyle = _a.activeStyle, inactiveStyle = _a.inactiveStyle, highlightStyle = _a.highlightStyle, highlightActive = _a.highlightActive;
        var buttonStyle = function (button, disabled) {
            if (disabled) {
                return inactiveStyle;
            }
            else if (button === highlightActive) {
                return highlightStyle;
            }
            return activeStyle;
        };
        this.updateMarker(nextButton, buttonStyle('next', nextButtonDisabled));
        this.updateMarker(previousButton, buttonStyle('previous', previousButtonDisabled));
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
            this.highlightActive = 'next';
        }
        else if (this.previousButtonContainsPoint(offsetX, offsetY)) {
            this.cursorManager.updateCursor(this.id, 'pointer');
            this.highlightActive = 'previous';
        }
        else {
            this.cursorManager.updateCursor(this.id);
            this.highlightActive = undefined;
        }
        this.updateMarkers();
        this.chartUpdateCallback(ChartUpdateType.SCENE_RENDER);
    };
    Pagination.prototype.onPaginationChanged = function () {
        this.pageUpdateCallback(this.currentPage);
    };
    Pagination.prototype.incrementPage = function () {
        this.currentPage = Math.min(this.currentPage + 1, this.totalPages - 1);
    };
    Pagination.prototype.decrementPage = function () {
        this.currentPage = Math.max(this.currentPage - 1, 0);
    };
    Pagination.prototype.onMarkerShapeChange = function () {
        var Marker = getMarker(this.marker.shape || Triangle);
        this.previousButton = new Marker();
        this.nextButton = new Marker();
        this.updatePositions();
        this.updateMarkers();
        this.chartUpdateCallback(ChartUpdateType.SCENE_RENDER);
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
export { Pagination };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9wYWdpbmF0aW9uL3BhZ2luYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDOUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3pDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQ0gsWUFBWSxFQUNaLE1BQU0sRUFDTixnQkFBZ0IsRUFDaEIsY0FBYyxFQUNkLGVBQWUsRUFDZixVQUFVLEVBQ1YsTUFBTSxFQUNOLFFBQVEsR0FDWCxNQUFNLHVCQUF1QixDQUFDO0FBRy9CO0lBQUE7UUFFSSxVQUFLLEdBQVcsT0FBTyxDQUFDO1FBR3hCLGNBQVMsR0FBZSxTQUFTLENBQUM7UUFHbEMsZUFBVSxHQUFnQixTQUFTLENBQUM7UUFHcEMsYUFBUSxHQUFXLEVBQUUsQ0FBQztRQUd0QixlQUFVLEdBQVcscUJBQXFCLENBQUM7SUFDL0MsQ0FBQztJQWJHO1FBREMsUUFBUSxDQUFDLFlBQVksQ0FBQztrREFDQztJQUd4QjtRQURDLFFBQVEsQ0FBQyxjQUFjLENBQUM7c0RBQ1M7SUFHbEM7UUFEQyxRQUFRLENBQUMsZUFBZSxDQUFDO3VEQUNVO0lBR3BDO1FBREMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztxREFDRTtJQUd0QjtRQURDLFFBQVEsQ0FBQyxNQUFN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
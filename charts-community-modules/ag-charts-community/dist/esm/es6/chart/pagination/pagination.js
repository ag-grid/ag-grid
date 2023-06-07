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
class PaginationLabel {
    constructor() {
        this.color = 'black';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
    }
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
class PaginationMarkerStyle {
    constructor() {
        this.size = 15;
        this.fill = undefined;
        this.fillOpacity = undefined;
        this.stroke = undefined;
        this.strokeWidth = 1;
        this.strokeOpacity = 1;
    }
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
class PaginationMarker {
    constructor() {
        this.size = 15;
        this._shape = Triangle;
        /**
         * Inner padding between a pagination button and the label.
         */
        this.padding = 8;
    }
    set shape(value) {
        var _a;
        this._shape = value;
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.onMarkerShapeChange();
    }
    get shape() {
        return this._shape;
    }
}
__decorate([
    Validate(NUMBER(0))
], PaginationMarker.prototype, "size", void 0);
__decorate([
    Validate(NUMBER(0))
], PaginationMarker.prototype, "padding", void 0);
export class Pagination {
    constructor(chartUpdateCallback, pageUpdateCallback, interactionManager, cursorManager) {
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
        const { labelNode } = this;
        labelNode.textBaseline = 'middle';
        labelNode.fontSize = 12;
        labelNode.fontFamily = 'Verdana, sans-serif';
        labelNode.fill = 'black';
        labelNode.y = HdpiCanvas.has.textMetrics ? 1 : 0;
        this.group.append([this.nextButton, this.previousButton, labelNode]);
        this.interactionManager.addListener('click', (event) => this.onPaginationClick(event));
        this.interactionManager.addListener('hover', (event) => this.onPaginationMouseMove(event));
        this.marker.parent = this;
        this.update();
        this.updateMarkers();
    }
    set visible(value) {
        this._visible = value;
        this.updateGroupVisibility();
    }
    get visible() {
        return this._visible;
    }
    set enabled(value) {
        this._enabled = value;
        this.updateGroupVisibility();
    }
    get enabled() {
        return this._enabled;
    }
    updateGroupVisibility() {
        this.group.visible = this.enabled && this.visible;
    }
    set orientation(value) {
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
    }
    get orientation() {
        return this._orientation;
    }
    set nextButton(value) {
        if (this._nextButton !== value) {
            this.group.removeChild(this._nextButton);
            this._nextButton = value;
            this.group.appendChild(value);
        }
    }
    get nextButton() {
        return this._nextButton;
    }
    set previousButton(value) {
        if (this._previousButton !== value) {
            this.group.removeChild(this._previousButton);
            this._previousButton = value;
            this.group.appendChild(value);
        }
    }
    get previousButton() {
        return this._previousButton;
    }
    update() {
        this.updateLabel();
        this.updatePositions();
        this.enableOrDisableButtons();
    }
    updatePositions() {
        this.group.translationX = this.translationX;
        this.group.translationY = this.translationY;
        this.updateLabelPosition();
        this.updateNextButtonPosition();
    }
    updateLabelPosition() {
        const { size: markerSize, padding: markerPadding } = this.marker;
        this.nextButton.size = markerSize;
        this.previousButton.size = markerSize;
        this.labelNode.x = markerSize / 2 + markerPadding;
    }
    updateNextButtonPosition() {
        const labelBBox = this.labelNode.computeBBox();
        this.nextButton.translationX = labelBBox.x + labelBBox.width + this.marker.size / 2 + this.marker.padding;
    }
    updateLabel() {
        const { currentPage, totalPages: pages, labelNode, label: { color, fontStyle, fontWeight, fontSize, fontFamily }, } = this;
        labelNode.text = `${currentPage + 1} / ${pages}`;
        labelNode.fill = color;
        labelNode.fontStyle = fontStyle;
        labelNode.fontWeight = fontWeight;
        labelNode.fontSize = fontSize;
        labelNode.fontFamily = fontFamily;
    }
    updateMarkers() {
        const { nextButton, previousButton, nextButtonDisabled, previousButtonDisabled, activeStyle, inactiveStyle, highlightStyle, highlightActive, } = this;
        const buttonStyle = (button, disabled) => {
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
    }
    updateMarker(marker, style) {
        var _a;
        const { size } = this.marker;
        marker.size = size;
        marker.fill = style.fill;
        marker.fillOpacity = (_a = style.fillOpacity) !== null && _a !== void 0 ? _a : 1;
        marker.stroke = style.stroke;
        marker.strokeWidth = style.strokeWidth;
        marker.strokeOpacity = style.strokeOpacity;
    }
    enableOrDisableButtons() {
        const { currentPage, totalPages } = this;
        const zeroPagesToDisplay = totalPages === 0;
        const onLastPage = currentPage === totalPages - 1;
        const onFirstPage = currentPage === 0;
        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        this.previousButtonDisabled = onFirstPage || zeroPagesToDisplay;
    }
    nextButtonContainsPoint(offsetX, offsetY) {
        return !this.nextButtonDisabled && this.nextButton.containsPoint(offsetX, offsetY);
    }
    previousButtonContainsPoint(offsetX, offsetY) {
        return !this.previousButtonDisabled && this.previousButton.containsPoint(offsetX, offsetY);
    }
    onPaginationClick(event) {
        const { offsetX, offsetY } = event;
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
    }
    onPaginationMouseMove(event) {
        const { offsetX, offsetY } = event;
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
    }
    onPaginationChanged() {
        this.pageUpdateCallback(this.currentPage);
    }
    incrementPage() {
        this.currentPage = Math.min(this.currentPage + 1, this.totalPages - 1);
    }
    decrementPage() {
        this.currentPage = Math.max(this.currentPage - 1, 0);
    }
    onMarkerShapeChange() {
        const Marker = getMarker(this.marker.shape || Triangle);
        this.previousButton = new Marker();
        this.nextButton = new Marker();
        this.updatePositions();
        this.updateMarkers();
        this.chartUpdateCallback(ChartUpdateType.SCENE_RENDER);
    }
    attachPagination(node) {
        node.append(this.group);
    }
    computeBBox() {
        return this.group.computeBBox();
    }
}
Pagination.className = 'Pagination';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9wYWdpbmF0aW9uL3BhZ2luYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDOUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3pDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQ0gsWUFBWSxFQUNaLE1BQU0sRUFDTixnQkFBZ0IsRUFDaEIsY0FBYyxFQUNkLGVBQWUsRUFDZixVQUFVLEVBQ1YsTUFBTSxFQUNOLFFBQVEsR0FDWCxNQUFNLHVCQUF1QixDQUFDO0FBRy9CLE1BQU0sZUFBZTtJQUFyQjtRQUVJLFVBQUssR0FBVyxPQUFPLENBQUM7UUFHeEIsY0FBUyxHQUFlLFNBQVMsQ0FBQztRQUdsQyxlQUFVLEdBQWdCLFNBQVMsQ0FBQztRQUdwQyxhQUFRLEdBQVcsRUFBRSxDQUFDO1FBR3RCLGVBQVUsR0FBVyxxQkFBcUIsQ0FBQztJQUMvQyxDQUFDO0NBQUE7QUFiRztJQURDLFFBQVEsQ0FBQyxZQUFZLENBQUM7OENBQ0M7QUFHeEI7SUFEQyxRQUFRLENBQUMsY0FBYyxDQUFDO2tEQUNTO0FBR2xDO0lBREMsUUFBUSxDQUFDLGVBQWUsQ0FBQzttREFDVTtBQUdwQztJQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aURBQ0U7QUFHdEI7SUFE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
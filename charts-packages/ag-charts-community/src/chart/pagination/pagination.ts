import { Group } from '../../scene/group';
import { Node, RedrawType } from '../../scene/node';
import { Marker } from '../marker/marker';
import { Triangle } from '../marker/triangle';
import { Text } from '../../scene/shape/text';
import { HdpiCanvas } from '../../canvas/hdpiCanvas';
import { InteractionEvent, InteractionManager } from '../interaction/interactionManager';
import {
    COLOR_STRING,
    NUMBER,
    OPT_COLOR_STRING,
    OPT_FONT_STYLE,
    OPT_FONT_WEIGHT,
    OPT_NUMBER,
    STRING,
    Validate,
} from '../../util/validation';
import { FontStyle, FontWeight } from '../agChartOptions';
import { getMarker } from '../marker/util';

enum Orientation {
    Vertical,
    Horizontal,
}

class PaginationLabel {
    @Validate(COLOR_STRING)
    color: string = 'black';

    @Validate(OPT_FONT_STYLE)
    fontStyle?: FontStyle = undefined;

    @Validate(OPT_FONT_WEIGHT)
    fontWeight?: FontWeight = undefined;

    @Validate(NUMBER(0))
    fontSize: number = 12;

    @Validate(STRING)
    fontFamily: string = 'Verdana, sans-serif';
}

class PaginationMarkerStyle {
    @Validate(NUMBER(0))
    size = 15;

    @Validate(OPT_COLOR_STRING)
    fill?: string;

    @Validate(OPT_NUMBER(0, 1))
    fillOpacity?: number = undefined;

    @Validate(OPT_COLOR_STRING)
    stroke?: string;

    @Validate(NUMBER(0))
    strokeWidth: number = 1;

    @Validate(NUMBER(0, 1))
    strokeOpacity: number = 1;
}

class PaginationMarker {
    @Validate(NUMBER(0))
    size = 15;

    _shape: string | (new () => Marker) = Triangle;
    set shape(value: string | (new () => Marker)) {
        this._shape = value;
        this.parent?.onMarkerShapeChange();
    }
    get shape() {
        return this._shape;
    }

    /**
     * Inner padding between a pagination button and the label.
     */
    @Validate(NUMBER(0))
    padding: number = 8;

    parent?: { onMarkerShapeChange(): void };
}

export class Pagination {
    static className = 'Pagination';

    private readonly group = new Group({ name: 'pagination' });
    private readonly labelNode: Text = new Text();

    readonly marker = new PaginationMarker();
    readonly activeStyle = new PaginationMarkerStyle();
    readonly inactiveStyle = new PaginationMarkerStyle();
    readonly highlightStyle = new PaginationMarkerStyle();
    readonly label = new PaginationLabel();

    private currentPage: number = 0;

    constructor(private readonly updateCallback: (newPage: number) => void, interactionManager: InteractionManager) {
        const { labelNode } = this;
        labelNode.textBaseline = 'middle';
        labelNode.fontSize = 12;
        labelNode.fontFamily = 'Verdana, sans-serif';
        labelNode.fill = 'black';
        labelNode.y = HdpiCanvas.has.textMetrics ? 1 : 0;

        this.group.append([this.nextButton, this.previousButton, labelNode]);

        interactionManager.addListener('click', (event) => this.onClick(event));

        this.marker.parent = this;

        this.updatePositions();
    }

    private nextButtonDisabled = false;
    private previousButtonDisabled = false;

    private _totalPages: number = 0;
    set totalPages(value: number) {
        if (this._totalPages !== value) {
            this._totalPages = value;
            this.setCurrentPage(0);
        }
        this.onPaginationChanged();
    }
    get totalPages() {
        return this._totalPages;
    }

    private _visible: boolean = true;
    set visible(value: boolean) {
        this._visible = value;
        this.updateGroupVisibility();
    }
    get visible() {
        return this._visible;
    }

    private _enabled = true;
    set enabled(value: boolean) {
        this._enabled = value;
        this.updateGroupVisibility();
    }
    get enabled() {
        return this._enabled;
    }

    private updateGroupVisibility() {
        this.group.visible = this.enabled && this.visible;
    }

    private _orientation: Orientation = Orientation.Vertical;
    set orientation(value: Orientation) {
        this._orientation = value;

        switch (value) {
            case Orientation.Horizontal: {
                this.previousButton.rotation = -Math.PI / 2;
                this.nextButton.rotation = Math.PI / 2;
                break;
            }
            case Orientation.Vertical:
            default: {
                this.nextButton.rotation = Math.PI;
            }
        }
    }
    get orientation() {
        return this._orientation;
    }

    set translationX(value: number) {
        this.group.translationX = value;
    }
    get translationX(): number {
        return this.group.translationX;
    }

    set translationY(value: number) {
        this.group.translationY = value;
    }
    get translationY(): number {
        return this.group.translationY;
    }

    private _nextButton: Marker = new Triangle();
    set nextButton(value: Marker) {
        if (this._nextButton !== value) {
            this.group.removeChild(this._nextButton);
            this._nextButton = value;
            this.group.appendChild(value);
        }
    }
    get nextButton(): Marker {
        return this._nextButton;
    }

    private _previousButton: Marker = new Triangle();
    set previousButton(value: Marker) {
        if (this._previousButton !== value) {
            this.group.removeChild(this._previousButton);
            this._previousButton = value;
            this.group.appendChild(value);
        }
    }
    get previousButton(): Marker {
        return this._previousButton;
    }

    private updatePositions() {
        this.updateLabelPosition();
        this.updateNextButtonPosition();
    }

    private updateLabelPosition() {
        const { size: markerSize, padding: markerPadding } = this.marker;

        this.nextButton.size = markerSize;
        this.previousButton.size = markerSize;

        this.labelNode.x = markerSize / 2 + markerPadding;
    }

    private updateNextButtonPosition() {
        const labelBBox = this.labelNode.computeBBox();
        this.nextButton.translationX = labelBBox.x + labelBBox.width + this.marker.size / 2 + this.marker.padding;
    }

    private updateLabel() {
        const { currentPage, totalPages: pages } = this;

        this.labelNode.text = `${currentPage + 1} / ${pages}`;
    }

    private updateMarkers() {
        const { nextButton, previousButton, nextButtonDisabled, previousButtonDisabled, activeStyle, inactiveStyle } =
            this;

        const nextButtonStyle = nextButtonDisabled ? inactiveStyle : activeStyle;
        this.updateMarker(nextButton, nextButtonStyle);

        const previousButtonStyle = previousButtonDisabled ? inactiveStyle : activeStyle;
        this.updateMarker(previousButton, previousButtonStyle);
    }

    private updateMarker(marker: Marker, style: PaginationMarkerStyle) {
        const { size } = this.marker;
        marker.size = size;
        marker.fill = style.fill;
        marker.fillOpacity = style.fillOpacity ?? 1;
        marker.stroke = style.stroke;
        marker.strokeWidth = style.strokeWidth;
        marker.strokeOpacity = style.strokeOpacity;
    }

    private enableOrDisableButtons() {
        const { currentPage, totalPages } = this;
        const zeroPagesToDisplay = totalPages === 0;
        const onLastPage = currentPage === totalPages - 1;
        const onFirstPage = currentPage === 0;

        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        this.previousButtonDisabled = onFirstPage || zeroPagesToDisplay;

        this.updateMarkers();
    }

    private onClick(event: InteractionEvent<'click'>) {
        const { offsetX, offsetY } = event;

        const { nextButton, previousButton, nextButtonDisabled, previousButtonDisabled } = this;

        if (!nextButtonDisabled && nextButton.containsPoint(offsetX, offsetY)) {
            this.incrementPage();
            this.onPaginationChanged();
        } else if (!previousButtonDisabled && previousButton.containsPoint(offsetX, offsetY)) {
            this.decrementPage();
            this.onPaginationChanged();
        }
    }

    private onPaginationChanged() {
        this.updateLabel();
        this.updateNextButtonPosition();
        this.enableOrDisableButtons();
        this.updateCallback(this.currentPage);
    }

    private incrementPage() {
        this.currentPage = Math.min(this.currentPage + 1, this.totalPages - 1);
    }

    private decrementPage() {
        this.currentPage = Math.max(this.currentPage - 1, 0);
    }

    getCurrentPage() {
        return this.currentPage;
    }

    setCurrentPage(page: number) {
        if (this.currentPage === page) {
            return;
        }

        this.currentPage = page;
        this.onPaginationChanged();
    }

    onMarkerShapeChange() {
        const Marker = getMarker(this.marker.shape || Triangle);
        this.previousButton = new Marker();
        this.nextButton = new Marker();
        this.updatePositions();
        this.updateMarkers();
        this.group.markDirty(this.group, RedrawType.MINOR);
    }

    attachPagination(node: Node) {
        node.append(this.group);
    }

    computeBBox() {
        return this.group.computeBBox();
    }
}

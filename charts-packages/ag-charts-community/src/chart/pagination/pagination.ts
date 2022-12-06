import { Group } from '../../scene/group';
import { Node } from '../../scene/node';
import { Marker } from '../marker/marker';
import { Triangle } from '../marker/triangle';
import { Text } from '../../scene/shape/text';
import { HdpiCanvas } from '../../canvas/hdpiCanvas';
import { InteractionEvent, InteractionManager } from '../interaction/interactionManager';

enum Orientation {
    Vertical,
    Horizontal,
}

export class Pagination {
    private group = new Group();

    label: Text = new Text();
    currentPage: number = 0;

    constructor(private readonly updateCallback: (newPage: number) => void, interactionManager: InteractionManager) {
        const label = this.label;
        label.textBaseline = 'middle';
        label.fontSize = 12;
        label.fontFamily = 'Verdana, sans-serif';
        label.fill = 'black';
        label.y = HdpiCanvas.has.textMetrics ? 1 : 0;

        this.group.append([this.nextButton, this.previousButton, label]);

        interactionManager.addListener('click', (event) => this.onClick(event));

        this.updatePositions();
    }

    private nextButtonDisabled = false;
    private previousButtonDisabled = false;

    private _totalPages: number = 0;
    set totalPages(value: number) {
        this._totalPages = value;
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
            this.updatePositions();
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
            this.updatePositions();
        }
    }
    get previousButton(): Marker {
        return this._previousButton;
    }

    private _markerSize: number = 15;
    set markerSize(value: number) {
        if (this._markerSize !== value) {
            this._markerSize = value;
            this.updatePositions();
        }
    }
    get markerSize(): number {
        return this._markerSize;
    }

    private _spacing: number = 8;
    set spacing(value: number) {
        if (this._spacing !== value) {
            this._spacing = value;
            this.updatePositions();
        }
    }
    get spacing(): number {
        return this._spacing;
    }

    private updatePositions() {
        this.updateLabelPosition();
        this.updateNextButtonPosition();
    }

    private updateLabelPosition() {
        const { markerSize } = this;

        this.nextButton.size = markerSize;
        this.previousButton.size = markerSize;

        this.label.x = markerSize / 2 + this.spacing;
    }

    private updateNextButtonPosition() {
        const labelBBox = this.label.computeBBox();
        this.nextButton.translationX = labelBBox.x + labelBBox.width + this.markerSize / 2 + this.spacing;
    }

    private updateLabel() {
        const { currentPage, totalPages: pages } = this;

        this.label.text = `${currentPage + 1} / ${pages}`;
    }

    private updateButtons() {
        const { nextButton, previousButton, nextButtonDisabled, previousButtonDisabled } = this;
        nextButton.fill = nextButtonDisabled ? 'grey' : 'blue';
        nextButton.stroke = nextButtonDisabled ? 'grey' : 'blue';

        previousButton.fill = previousButtonDisabled ? 'grey' : 'blue';
        previousButton.stroke = previousButtonDisabled ? 'grey' : 'blue';
    }

    private enableOrDisableButtons() {
        const { currentPage, totalPages } = this;
        const zeroPagesToDisplay = totalPages === 0;
        const onLastPage = currentPage === totalPages - 1;
        const onFirstPage = currentPage === 0;

        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        this.previousButtonDisabled = onFirstPage || zeroPagesToDisplay;

        this.updateButtons();
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

    attachPagination(node: Node) {
        node.append(this.group);
    }

    computeBBox() {
        return this.group.computeBBox();
    }
}

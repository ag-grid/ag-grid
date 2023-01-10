import { Node } from '../../scene/node';
import { Marker } from '../marker/marker';
import { InteractionManager } from '../interaction/interactionManager';
import { CursorManager } from '../interaction/cursorManager';
import { ChartUpdateType } from '../chart';
import { AgChartOrientation, FontStyle, FontWeight } from '../agChartOptions';
declare class PaginationLabel {
    color: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
}
declare class PaginationMarkerStyle {
    size: number;
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth: number;
    strokeOpacity: number;
}
declare class PaginationMarker {
    size: number;
    _shape: string | (new () => Marker);
    set shape(value: string | (new () => Marker));
    get shape(): string | (new () => Marker);
    /**
     * Inner padding between a pagination button and the label.
     */
    padding: number;
    parent?: {
        onMarkerShapeChange(): void;
    };
}
export declare class Pagination {
    private readonly chartUpdateCallback;
    private readonly pageUpdateCallback;
    private readonly interactionManager;
    private readonly cursorManager;
    static className: string;
    readonly id: string;
    private readonly group;
    private readonly labelNode;
    readonly marker: PaginationMarker;
    readonly activeStyle: PaginationMarkerStyle;
    readonly inactiveStyle: PaginationMarkerStyle;
    readonly highlightStyle: PaginationMarkerStyle;
    readonly label: PaginationLabel;
    constructor(chartUpdateCallback: (type: ChartUpdateType) => void, pageUpdateCallback: (newPage: number) => void, interactionManager: InteractionManager, cursorManager: CursorManager);
    private nextButtonDisabled;
    private previousButtonDisabled;
    private _totalPages;
    set totalPages(value: number);
    get totalPages(): number;
    private _currentPage;
    set currentPage(value: number);
    get currentPage(): number;
    private _visible;
    set visible(value: boolean);
    get visible(): boolean;
    private _enabled;
    set enabled(value: boolean);
    get enabled(): boolean;
    private updateGroupVisibility;
    private _orientation;
    set orientation(value: AgChartOrientation);
    get orientation(): AgChartOrientation;
    set translationX(value: number);
    get translationX(): number;
    set translationY(value: number);
    get translationY(): number;
    private _nextButton;
    set nextButton(value: Marker);
    get nextButton(): Marker;
    private _previousButton;
    set previousButton(value: Marker);
    get previousButton(): Marker;
    private update;
    private updatePositions;
    private updateLabelPosition;
    private updateNextButtonPosition;
    private updateLabel;
    private updateMarkers;
    private updateMarker;
    private enableOrDisableButtons;
    private nextButtonContainsPoint;
    private previousButtonContainsPoint;
    private onPaginationClick;
    private onPaginationMouseMove;
    private onPaginationChanged;
    private incrementPage;
    private decrementPage;
    onMarkerShapeChange(): void;
    attachPagination(node: Node): void;
    computeBBox(): import("../../scene/bbox").BBox;
}
export {};

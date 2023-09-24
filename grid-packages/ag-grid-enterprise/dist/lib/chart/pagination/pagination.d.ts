import type { Node } from '../../scene/node';
import type { Marker } from '../marker/marker';
import type { InteractionManager } from '../interaction/interactionManager';
import type { CursorManager } from '../interaction/cursorManager';
import { ChartUpdateType } from '../chartUpdateType';
import type { AgChartOrientation, FontStyle, FontWeight } from '../agChartOptions';
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
    private highlightActive?;
    constructor(chartUpdateCallback: (type: ChartUpdateType) => void, pageUpdateCallback: (newPage: number) => void, interactionManager: InteractionManager, cursorManager: CursorManager);
    totalPages: number;
    currentPage: number;
    translationX: number;
    translationY: number;
    private nextButtonDisabled;
    private previousButtonDisabled;
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
    private _nextButton;
    set nextButton(value: Marker);
    get nextButton(): Marker;
    private _previousButton;
    set previousButton(value: Marker);
    get previousButton(): Marker;
    update(): void;
    private updatePositions;
    private updateLabelPosition;
    private updateNextButtonPosition;
    private updateLabel;
    updateMarkers(): void;
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
    computeBBox(): import("../../integrated-charts-scene").BBox;
}
export {};
//# sourceMappingURL=pagination.d.ts.map
import {
    _addOrRemoveAttribute,
    _batchCall,
    _escapeString,
    _exists,
    _getActiveDomElement,
    _isElementChildOfClass,
    _isVisible,
    _makeNull,
    _setAriaExpanded,
    _setAriaRowIndex,
} from 'ag-stack';

import { setupCompBean } from '../../components/emptyBean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowStyle } from '../../entities/gridOptions';
import { _getAbsoluteRowIndex } from '../../entities/positionUtils';
import type { RowNode } from '../../entities/rowNode';
import type { AgEventType } from '../../eventTypes';
import type {
    CellFocusedEvent,
    RowClickedEvent,
    RowDoubleClickedEvent,
    RowEvent,
    VirtualRowRemovedEvent,
} from '../../events';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import {
    _addGridCommonParams,
    _getRowHeightForNode,
    _isAnimateRows,
    _isDomLayout,
    _isFullWidthGroupRow,
    _isGetRowHeightFunction,
    _isRowSelection,
    _setDomData,
} from '../../gridOptionsUtils';
import type { PinnedSectionWidths } from '../../headerRendering/headerUtils';
import { getAriaHeaderRowCount, getPinnedSectionWidths } from '../../headerRendering/headerUtils';
import type { BrandedType } from '../../interfaces/brandedType';
import type { ProcessRowParams, RenderedRowEvent } from '../../interfaces/iCallbackParams';
import type { RefreshRowsParams } from '../../interfaces/iCellsParams';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { WithoutGridCommon } from '../../interfaces/iCommon';
import type { HorizontalSection, HorizontalSectionMap } from '../../interfaces/iGridSection';
import type { DataChangedEvent, IRowNode } from '../../interfaces/iRowNode';
import type { RowPosition } from '../../interfaces/iRowPosition';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { GetNoteParams } from '../../interfaces/notes';
import { calculateRowLevel } from '../../styling/rowStyleService';
import { _isStopPropagationForAgGrid } from '../../utils/gridEvent';
import { _clamp } from '../../utils/number';
import type { Component } from '../../widgets/component';
import { CellCtrl } from '../cell/cellCtrl';
import type { ICellRenderer, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import { DOM_DATA_KEY_ROW_CTRL } from '../renderUtils';
import { FullWidthRowFeature } from './fullWidthRowFeature';
import type { FullWidthTarget, IRowModeFeature } from './iRowModeFeature';
import { NormalRowFeature } from './normalRowFeature';

type RowType = 'Normal' | 'FullWidth' | 'FullWidthLoading' | 'FullWidthGroup' | 'FullWidthDetail';

let instanceIdSequence = 0;
export type RowCtrlInstanceId = BrandedType<string, 'RowCtrlInstanceId'>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowComp {
    setDomOrder(domOrder: boolean): void;
    toggleCss(cssClassName: string, on: boolean): void;
    setCellCtrls(cellCtrls: CellCtrl[], useFlushSync: boolean): void;
    getPinnedLeftRowElement(): HTMLElement | undefined;
    getScrollingRowElement(): HTMLElement | undefined;
    getPinnedRightRowElement(): HTMLElement | undefined;
    refreshPinnedSections(): void;
    showFullWidth(compDetails: UserCompDetails): void;
    showEmbeddedFullWidth?(compDetails: HorizontalSectionMap<UserCompDetails>): void;
    getFullWidthCellRenderers(): (ICellRenderer | null | undefined)[];
    getFullWidthCellRendererParams(): ICellRendererParams | undefined;
    getFullWidthCellRendererParamsForPinned?(pinned: ColumnPinnedType): ICellRendererParams | undefined;
    setTop(top: string): void;
    setTransform(transform: string): void;
    setRowIndex(rowIndex: string): void;
    setRowId(rowId: string): void;
    setRowBusinessKey(businessKey: string): void;
    setUserStyles(styles: RowStyle | undefined): void;
    refreshFullWidth(getUpdatedParams: () => ICellRendererParams): boolean;
    refreshEmbeddedFullWidth?(getUpdatedParams: (pinned: ColumnPinnedType) => ICellRendererParams): boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface RowGui {
    rowComp: IRowComp;
    element: HTMLElement;
    containerType: RowContainerType;
    compBean: BeanStub;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type PinnedCellGroupWidths = PinnedSectionWidths;

interface MappedPinnedCellGroupWidths extends PinnedCellGroupWidths {
    renderLeft: boolean;
    renderRight: boolean;
}

type RowCtrlEvent = RenderedRowEvent;
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class RowCtrl extends BeanStub<RowCtrlEvent> {
    public readonly instanceId: RowCtrlInstanceId;

    private rowType: RowType;

    private rowGui: RowGui | undefined;
    private readonly rowModeFeature: IRowModeFeature;

    private firstRowOnPage: boolean;
    private lastRowOnPage: boolean;

    private active = true;

    private rowFocused: boolean;

    private slideInAnimation = false;
    private fadeInAnimation = false;

    private rowDragComps: Component[] = [];

    private paginationPage: number;

    private lastMouseDownOnDragger = false;

    private rowLevel: number;
    public rowStyles: RowStyle;
    private readonly emptyStyle: RowStyle = {};
    private readonly suppressRowTransform: boolean;

    public rowId: string | null = null;
    public ariaRowIndex: number | null = null;
    /** sanitised */
    public businessKey: string | null = null;
    private businessKeyForNodeFunc: ((node: IRowNode<any>) => string) | undefined;

    public isEmbeddedFullWidth = false;
    public embeddedSectionHasContent: HorizontalSectionMap<boolean> = {
        left: true,
        center: true,
        right: true,
    };

    constructor(
        public readonly rowNode: RowNode,
        beans: BeanCollection,
        animateIn: boolean,
        public readonly useAnimationFrameForCreate: boolean,
        public readonly printLayout: boolean
    ) {
        super();
        this.beans = beans;
        this.gos = beans.gos;
        this.paginationPage = beans.pagination?.getCurrentPage() ?? 0;
        this.suppressRowTransform = this.gos.get('suppressRowTransform');

        this.instanceId = (rowNode.id + '-' + instanceIdSequence++) as RowCtrlInstanceId;
        this.rowId = _escapeString(rowNode.id);

        this.initRowBusinessKey();

        this.rowFocused = beans.focusSvc.isRowFocused(this.rowNode.rowIndex!, this.rowNode.rowPinned);
        this.rowLevel = calculateRowLevel(this.rowNode);

        this.setRowType();
        this.setAnimateFlags(animateIn);
        this.rowStyles = this.processStylesFromGridOptions();
        this.rowModeFeature = this.createRowModeFeature();

        this.addListeners();

        this.rowModeFeature.prepareInitialCellCtrls?.();
    }

    private createRowModeFeature(): IRowModeFeature {
        const { context } = this.beans;
        const feature = this.isFullWidth() ? new FullWidthRowFeature(this) : new NormalRowFeature(this);

        this.createBean(feature, context);
        this.addDestroyFunc(() => this.destroyBean(feature, context));
        return feature;
    }

    private initRowBusinessKey(): void {
        this.businessKeyForNodeFunc = this.gos.get('getBusinessKeyForNode');
        this.updateRowBusinessKey();
    }

    private updateRowBusinessKey(): void {
        if (typeof this.businessKeyForNodeFunc !== 'function') {
            return;
        }
        const businessKey = this.businessKeyForNodeFunc(this.rowNode);
        this.businessKey = _escapeString(businessKey);
    }

    public setComp(
        rowComp: IRowComp,
        element: HTMLElement,
        containerType: RowContainerType,
        compBean: BeanStub<any> | undefined
    ): void {
        const { context, rowRenderer } = this.beans;
        const rowCompBean = setupCompBean(this, context, compBean);

        const rowGui: RowGui = { rowComp, element, containerType, compBean: rowCompBean };
        this.rowGui = rowGui;

        this.initialiseRowComp();

        const rowNode = this.rowNode;
        const isSsrmLoadingRow = this.rowType === 'FullWidthLoading' || rowNode.stub;
        const isIrmLoadingRow = !rowNode.data && this.beans.rowModel.getType() === 'infinite';
        // pinned rows render before the main grid body in the SSRM, only fire the event after the main body has rendered.
        if (!isSsrmLoadingRow && !isIrmLoadingRow && !rowNode.rowPinned) {
            // this is fired within setComp as we know that the component renderer is now trying to render.
            // linked with the fact the function implementation queues behind requestAnimationFrame should allow
            // us to be certain that all rendering is done by the time the event fires.
            rowRenderer.dispatchFirstDataRenderedEvent();
        }

        this.rowModeFeature.setupFocus?.();
    }

    public unsetComp(containerType: RowContainerType): void {
        if (this.rowGui?.containerType === containerType) {
            this.rowGui = undefined;
        }
    }

    public isCacheable(): boolean {
        return this.rowType === 'FullWidthDetail' && this.gos.get('keepDetailRows');
    }

    public setCached(cached: boolean): void {
        const displayValue = cached ? 'none' : '';
        this.rowGui?.element.style.setProperty('display', displayValue);
    }

    private initialiseRowComp(): void {
        const rowGui = this.rowGui;
        if (!rowGui) {
            return;
        }

        const gos = this.gos;

        this.onSuppressCellFocusChanged(this.beans.gos.get('suppressCellFocus'));

        this.listenOnDomOrder(rowGui);
        this.onRowHeightChanged();
        this.updateRowIndexes();
        this.setFocusedClasses();
        this.setStylesFromGridOptions(false); // no need to calculate styles already set in constructor

        if (_isRowSelection(gos) && this.rowNode.selectable) {
            this.onRowSelected();
        }

        this.rowModeFeature.initialiseComp();

        const { rowComp, element, compBean } = rowGui;

        const initialRowClasses = this.getInitialRowClasses();
        for (const name of initialRowClasses) {
            rowComp.toggleCss(name, true);
        }
        this.executeSlideAndFadeAnimations();

        if (this.rowNode.group) {
            _setAriaExpanded(element, !!this.rowNode.expanded);
        }

        this.setRowCompRowId();
        this.setRowCompRowBusinessKey();

        // DOM DATA
        _setDomData(gos, element, DOM_DATA_KEY_ROW_CTRL, this);
        compBean.addDestroyFunc(() => _setDomData(gos, element, DOM_DATA_KEY_ROW_CTRL, null));

        // adding hover functionality adds listener to this row, so we
        // do it lazily in an animation frame
        if (this.useAnimationFrameForCreate) {
            this.beans.animationFrameSvc!.createTask(
                this.addHoverFunctionality.bind(this, rowGui),
                this.rowNode.rowIndex!,
                'p2',
                false
            );
        } else {
            this.addHoverFunctionality(rowGui);
        }

        if (gos.get('rowDragEntireRow')) {
            this.addRowDraggerToRow();
        }

        if (this.useAnimationFrameForCreate) {
            // the height animation we only want active after the row is alive for 1 second.
            // this stops the row animation working when rows are initially created. otherwise
            // auto-height rows get inserted into the dom and resized immediately, which gives
            // very bad UX (eg 10 rows get inserted, then all 10 expand, look particularly bad
            // when scrolling). so this makes sure when rows are shown for the first time, they
            // are resized immediately without animation.
            this.beans.animationFrameSvc!.addDestroyTask(() => {
                if (!this.isAlive()) {
                    return;
                }
                rowComp.toggleCss('ag-after-created', true);
            });
        }

        this.executeProcessRowPostCreateFunc();
    }

    private setRowCompRowBusinessKey(): void {
        if (this.businessKey == null) {
            return;
        }
        this.rowGui?.rowComp.setRowBusinessKey(this.businessKey);
    }

    private setRowCompRowId() {
        const rowId = _escapeString(this.rowNode.id);
        this.rowId = rowId;
        if (rowId == null) {
            return;
        }

        this.rowGui?.rowComp.setRowId(rowId);
    }

    private executeSlideAndFadeAnimations(): void {
        const rowGui = this.rowGui;
        if (!rowGui) {
            return;
        }

        if (this.slideInAnimation) {
            _batchCall(() => {
                this.onTopChanged();
            });
            this.slideInAnimation = false;
        }

        if (this.fadeInAnimation) {
            _batchCall(() => {
                rowGui.rowComp.toggleCss('ag-opacity-zero', false);
            });
            this.fadeInAnimation = false;
        }
    }

    private addRowDraggerToRow() {
        const rowGui = this.rowGui;
        if (!rowGui) {
            return;
        }
        const rowDragComp = this.beans.rowDragSvc?.createRowDragCompForRow(this.rowNode, rowGui.element);
        if (!rowDragComp) {
            return;
        }
        const rowDragBean = this.createBean(rowDragComp, this.beans.context);
        this.rowDragComps.push(rowDragBean);
        rowGui.compBean.addDestroyFunc(() => {
            this.rowDragComps = this.rowDragComps.filter((r) => r !== rowDragBean);
            this.destroyBean(rowDragBean, this.beans.context);
        });
    }

    public getModeCellRenderers(): (ICellRenderer<any> | null | undefined)[] {
        return this.rowModeFeature.getModeCellRenderers?.() ?? [];
    }

    private executeProcessRowPostCreateFunc(): void {
        const func = this.gos.getCallback('processRowPostCreate');
        const rowGui = this.rowGui;
        if (!func || rowGui?.containerType !== 'center') {
            return;
        }

        // In the flattened layout there is a single row element per row. Preserve `latest`'s
        // contract by mapping the legacy pinned-row params to that same element when the
        // corresponding pinned section has columns, and `undefined` otherwise.
        const { visibleCols } = this.beans;
        const eRow = rowGui.element;
        const params: WithoutGridCommon<ProcessRowParams> = {
            eRow,
            ePinnedLeftRow: visibleCols.leftCols.length ? eRow : undefined,
            ePinnedRightRow: visibleCols.rightCols.length ? eRow : undefined,
            node: this.rowNode,
            rowIndex: this.rowNode.rowIndex!,
            addRenderedRowListener: this.addEventListener.bind(this),
        };
        func(params);
    }

    private isNodeFullWidthCell(): boolean {
        if (this.rowNode.detail) {
            return true;
        }

        const isFullWidthCellFunc = this.beans.gos.getCallback('isFullWidthRow');
        return isFullWidthCellFunc ? isFullWidthCellFunc({ rowNode: this.rowNode }) : false;
    }

    private setRowType(): void {
        // groupHideOpenParents implicitly disables full width loading
        const {
            rowNode,
            gos,
            beans: { colModel },
        } = this;
        const suppressFullWidthLoading = gos.get('suppressServerSideFullWidthLoadingRow');
        const groupHideOpenParents = gos.get('groupHideOpenParents');
        const isStub = rowNode.stub && !suppressFullWidthLoading && !groupHideOpenParents;
        const isFullWidthCell = this.isNodeFullWidthCell();
        const isDetailCell = gos.get('masterDetail') && rowNode.detail;
        const pivotMode = colModel.pivotMode;
        const isFullWidthGroup = _isFullWidthGroupRow(gos, rowNode, pivotMode);
        // When suppressServerSideFullWidthLoadingRow is set, stub group rows (groupDisplayType='groupRows')
        // fall through to Normal so they render per-cell skeletons, consistent with leaf row stubs.
        const isSuppressedGroupStub =
            suppressFullWidthLoading && rowNode.stub && isFullWidthGroup && !groupHideOpenParents;

        if (isStub) {
            this.rowType = 'FullWidthLoading';
        } else if (isDetailCell) {
            this.rowType = 'FullWidthDetail';
        } else if (isFullWidthCell) {
            this.rowType = 'FullWidth';
        } else if (isFullWidthGroup && !isSuppressedGroupStub) {
            this.rowType = 'FullWidthGroup';
        } else {
            this.rowType = 'Normal';
        }
    }

    /**
     * Overridden by SpannedRowCtrl
     */
    public getNewCellCtrl(col: AgColumn): CellCtrl | undefined {
        const isCellSpan = this.beans.rowSpanSvc?.isCellSpanning(col, this.rowNode);
        if (isCellSpan) {
            return undefined;
        }
        return new CellCtrl(col, this.rowNode, this.beans, this);
    }

    /**
     * Overridden by SpannedRowCtrl, if span context changes cell needs rebuilt
     */
    public isCorrectCtrlForSpan(cell: CellCtrl): boolean {
        return !this.beans.rowSpanSvc?.isCellSpanning(cell.column, this.rowNode);
    }

    public setEmbeddedSectionHasContent(section: HorizontalSection, hasContent: boolean): void {
        this.embeddedSectionHasContent[section] = hasContent;
    }

    public refreshPinnedCellGroupWidths(): void {
        const rowGui = this.rowGui;
        if (!rowGui) {
            return;
        }
        rowGui.rowComp.refreshPinnedSections();
    }

    public getMappedPinnedCellGroupWidths(): MappedPinnedCellGroupWidths {
        let { leftWidth, centerWidth, rightWidth } = this.getPinnedCellGroupWidths();

        if (this.isEmbeddedFullWidth) {
            const hasLeft = this.embeddedSectionHasContent.left;
            const hasRight = this.embeddedSectionHasContent.right;

            centerWidth = centerWidth + (hasLeft ? 0 : leftWidth) + (hasRight ? 0 : rightWidth);
            leftWidth = hasLeft ? leftWidth : 0;
            rightWidth = hasRight ? rightWidth : 0;
        }

        const isFullWidth = this.isFullWidth();

        return {
            leftWidth,
            centerWidth,
            rightWidth,
            // Pinned lanes are omitted from the DOM when they have no width to
            // improve rendering performance. Full width rows always render the
            // lanes, because the row renderer requires a reference to them even
            // when they are empty.
            renderLeft: leftWidth > 0 || isFullWidth,
            renderRight: rightWidth > 0 || isFullWidth,
        };
    }

    public getPinnedCellGroupWidths(): PinnedCellGroupWidths {
        return getPinnedSectionWidths(this.beans.visibleCols, this.printLayout);
    }

    /**
     * CellCtrls for rows whose normal-mode feature eagerly created cells in the constructor.
     * React uses this to seed first render and avoid an empty row flash on bulk add.
     */
    public getInitialCellCtrls(containerType: RowContainerType): CellCtrl[] | null {
        return this.rowModeFeature.getInitialCellCtrls?.(containerType) ?? null;
    }

    public getDomOrder(): boolean {
        const isEnsureDomOrder = this.gos.get('ensureDomOrder');
        return isEnsureDomOrder || _isDomLayout(this.gos, 'print');
    }

    private listenOnDomOrder(gui: RowGui): void {
        const listener = () => {
            gui.rowComp.setDomOrder(this.getDomOrder());
        };

        gui.compBean.addManagedPropertyListeners(['domLayout', 'ensureDomOrder'], listener);
    }

    private setAnimateFlags(animateIn: boolean): void {
        if (this.rowNode.sticky || !animateIn) {
            return;
        }

        if (_exists(this.rowNode.oldRowTop)) {
            this.slideInAnimation = true;
        } else {
            this.fadeInAnimation = true;
        }
    }

    public isFullWidth(): boolean {
        return this.rowType !== 'Normal';
    }

    /** Called by NormalRowFeature after refreshing cells */
    public onNormalRowRefreshed(): void {
        this.setRowCompRowId();
        this.updateRowBusinessKey();
        this.setRowCompRowBusinessKey();

        this.onRowSelected();
        this.postProcessCss();
    }

    public getCurrentRowComp(): IRowComp | undefined {
        return this.rowGui?.rowComp;
    }

    public getCurrentRowElement(): HTMLElement | undefined {
        return this.rowGui?.element;
    }

    public redrawThisRow(): void {
        this.beans.rowRenderer.redrawRow(this.rowNode);
    }

    public getRowType(): RowType {
        return this.rowType;
    }

    public getContainerType(): RowContainerType | undefined {
        return this.rowGui?.containerType;
    }

    public shouldCreateCellSections(): boolean {
        return this.rowModeFeature.shouldCreateCellSections();
    }

    public getNotesFeature() {
        return this.rowModeFeature.getNotesFeature?.();
    }

    private addListeners(): void {
        const { beans, gos, rowNode } = this;
        const { expansionSvc, eventSvc, context, rowSpanSvc } = beans;

        this.addManagedListeners(this.rowNode, {
            heightChanged: () => this.onRowHeightChanged(),
            rowSelected: () => this.onRowSelected(),
            rowIndexChanged: this.onRowIndexChanged.bind(this),
            topChanged: this.onTopChanged.bind(this),
            ...(expansionSvc?.getRowExpandedListeners(this) ?? {}),
        });

        if (rowNode.detail) {
            // if the master row node has updated data, we also want to try to refresh the detail row
            this.addManagedListeners(rowNode.parent!, { dataChanged: this.onRowNodeDataChanged.bind(this) });
        }

        this.addManagedListeners(rowNode, {
            dataChanged: this.onRowNodeDataChanged.bind(this),
            cellChanged: this.postProcessCss.bind(this),
            rowHighlightChanged: this.onRowNodeHighlightChanged.bind(this),
            draggingChanged: this.postProcessRowDragging.bind(this),
            uiLevelChanged: this.onUiLevelChanged.bind(this),
            rowPinned: this.onRowPinned.bind(this),
        });

        this.addManagedListeners(eventSvc, {
            paginationPixelOffsetChanged: this.onPaginationPixelOffsetChanged.bind(this),
            heightScaleChanged: this.onTopChanged.bind(this),
            headerHeightChanged: this.onTopChanged.bind(this),
            headerRowsChanged: this.updateRowIndexes.bind(this),
            advancedFilterEnabledChanged: this.updateRowIndexes.bind(this),
            // Manual row pinning (`isRowPinned`) can change pinned row counts without changing a body row's rowIndex.
            // Recompute aria row index whenever pinned rows change so absolute row order stays correct.
            pinnedRowsChanged: this.onPinnedRowsChanged.bind(this),
            pinnedRowDataChanged: this.onPinnedRowsChanged.bind(this),
            stickyBottomOffsetChanged: this.onStickyBottomOffsetChanged.bind(this),
            displayedColumnsChanged: this.onDisplayedColumnsChanged.bind(this),
            displayedColumnsWidthChanged: this.refreshPinnedCellGroupWidths.bind(this),
            leftPinnedWidthChanged: this.refreshPinnedCellGroupWidths.bind(this),
            rightPinnedWidthChanged: this.refreshPinnedCellGroupWidths.bind(this),
            virtualColumnsChanged: this.onVirtualColumnsChanged.bind(this),
            cellFocused: this.onCellFocusChanged.bind(this),
            cellFocusCleared: this.onCellFocusChanged.bind(this),
            paginationChanged: this.onPaginationChanged.bind(this),
            modelUpdated: () => {
                // Pinned bottom rows depend on displayed row count for absolute aria row index.
                if (this.rowNode.rowPinned === 'bottom') {
                    this.updateRowIndexes();
                }
                this.refreshFirstAndLastRowStyles();
            },
            columnMoved: () => {
                this.rowModeFeature.onColumnMoved();
            },
        });

        if (rowSpanSvc?.active) {
            // when spans change, need to verify that cells are correctly skipped/rendered
            this.addManagedListeners(rowSpanSvc, {
                spannedCellsUpdated: ({ pinned }) => {
                    this.rowModeFeature.onSpannedCellsUpdated(pinned);
                },
            });
        }

        this.addDestroyFunc(() => {
            this.rowDragComps = this.destroyBeans(this.rowDragComps, context);
        });

        this.addManagedPropertyListeners(
            ['rowStyle', 'getRowStyle', 'rowClass', 'getRowClass', 'rowClassRules'],
            this.postProcessCss.bind(this)
        );

        this.addManagedPropertyListener('rowDragEntireRow', () => {
            const useRowDragEntireRow = gos.get('rowDragEntireRow');
            if (useRowDragEntireRow) {
                this.addRowDraggerToRow();
                return;
            }
            this.rowDragComps = this.destroyBeans(this.rowDragComps, context);
        });
    }

    /** Should only ever be triggered on source rows (i.e. not on pinned siblings) */
    private onRowPinned(): void {
        this.rowGui?.rowComp.toggleCss('ag-row-pinned-source', !!this.rowNode.pinnedSibling);
    }

    private onRowNodeDataChanged(event: DataChangedEvent): void {
        this.refreshRow({
            suppressFlash: !event.update,
            newData: !event.update,
        });
    }

    public refreshRow(params?: RefreshRowsParams & { newData?: boolean }): void {
        // if the row is rendered incorrectly, as the requirements for whether this is a FW row have changed, we force re-render this row.
        const fullWidthChanged = this.isFullWidth() !== !!this.isNodeFullWidthCell();
        if (fullWidthChanged) {
            this.beans.rowRenderer.redrawRow(this.rowNode);
            return;
        }

        this.rowModeFeature.refreshRow(params ?? {});
    }

    private postProcessCss(): void {
        this.setStylesFromGridOptions(true);
        this.postProcessClassesFromGridOptions();
        this.postProcessRowClassRules();
        this.beans.editSvc?.applyRowEditStyles(this);
        this.postProcessRowDragging();
    }

    private onRowNodeHighlightChanged(): void {
        const {
            rowGui,
            beans: { rowDropHighlightSvc },
        } = this;
        const highlighted = rowDropHighlightSvc?.row === this.rowNode ? rowDropHighlightSvc.position : 'none';

        const aboveOn = highlighted === 'above';
        const insideOn = highlighted === 'inside';
        const belowOn = highlighted === 'below';
        const highlightActive = highlighted !== 'none';
        const dropEdge = aboveOn || belowOn;
        const uiLevel = this.rowNode.uiLevel;
        const shouldIndent = dropEdge && uiLevel > 0;
        const highlightLevel = shouldIndent ? uiLevel.toString() : '0';

        rowGui?.rowComp.toggleCss('ag-row-highlight-above', aboveOn);
        rowGui?.rowComp.toggleCss('ag-row-highlight-inside', insideOn);
        rowGui?.rowComp.toggleCss('ag-row-highlight-below', belowOn);
        rowGui?.rowComp.toggleCss('ag-row-highlight-indent', shouldIndent);
        if (highlightActive) {
            rowGui?.element.style.setProperty('--ag-row-highlight-level', highlightLevel);
        } else {
            rowGui?.element.style.removeProperty('--ag-row-highlight-level');
        }
    }

    private postProcessRowDragging(): void {
        const { rowNode, rowGui } = this;
        const dragging = rowNode.dragging;
        rowGui?.rowComp.toggleCss('ag-row-dragging', dragging);
    }

    private onDisplayedColumnsChanged(): void {
        this.rowModeFeature.onDisplayedColumnsChanged();
    }

    private onVirtualColumnsChanged(): void {
        this.rowModeFeature.onVirtualColumnsChanged();
    }

    public getRowPosition(): RowPosition {
        return {
            rowPinned: _makeNull(this.rowNode.rowPinned),
            rowIndex: this.rowNode.rowIndex as number,
        };
    }

    public onKeyboardNavigate(keyboardEvent: KeyboardEvent) {
        this.rowModeFeature.onKeyboardNavigate?.(keyboardEvent);
    }

    public onTabKeyDown(keyboardEvent: KeyboardEvent) {
        this.rowModeFeature.onTabKeyDown?.(keyboardEvent);
    }

    public getRowContentElement(): HTMLElement | null {
        return this.rowModeFeature.getRowContentElement?.() ?? null;
    }

    public getNavigationColumn(): AgColumn {
        return this.rowModeFeature.getNavigationColumn!();
    }

    public getRowYPosition(): number {
        const displayedEl = this.rowGui?.element;

        if (displayedEl && _isVisible(displayedEl)) {
            return displayedEl.getBoundingClientRect().top;
        }

        return 0;
    }

    public onSuppressCellFocusChanged(suppressCellFocus: boolean): void {
        const tabIndex = this.isFullWidth() && suppressCellFocus ? undefined : this.gos.get('tabIndex');
        if (this.rowGui) {
            _addOrRemoveAttribute(this.rowGui.element, 'tabindex', tabIndex);
        }
    }

    public onRowFocused(event?: CellFocusedEvent) {
        this.rowModeFeature.onRowFocused?.(event);
    }

    public recreateCell(cellCtrl: CellCtrl) {
        this.rowModeFeature.recreateCell(cellCtrl);
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        switch (eventName) {
            case 'dblclick':
                this.onRowDblClick(mouseEvent);
                break;
            case 'click':
                this.onRowClick(mouseEvent);
                break;
            case 'pointerdown':
            case 'touchstart':
            case 'mousedown':
                this.onRowMouseDown(mouseEvent);
                break;
        }
    }

    public createRowEvent<T extends AgEventType>(type: T, domEvent?: Event): RowEvent<T> {
        const { rowNode } = this;
        return _addGridCommonParams(this.gos, {
            type: type,
            node: rowNode,
            data: rowNode.data,
            rowIndex: rowNode.rowIndex!,
            rowPinned: rowNode.rowPinned,
            event: domEvent,
        });
    }

    private createRowEventWithSource<T extends AgEventType>(type: T, domEvent: Event): RowEvent<T> {
        const event = this.createRowEvent(type, domEvent);
        // when first developing this, we included the rowComp in the event.
        // this seems very weird. so when introducing the event types, i left the 'source'
        // out of the type, and just include the source in the two places where this event
        // was fired (rowClicked and rowDoubleClicked). it doesn't make sense for any
        // users to be using this, as the rowComp isn't an object we expose, so would be
        // very surprising if a user was using it.
        (event as any).source = this;
        return event;
    }

    private onRowDblClick(mouseEvent: MouseEvent): void {
        if (_isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }

        const rowEvent = this.createRowEventWithSource('rowDoubleClicked', mouseEvent) as RowDoubleClickedEvent;
        rowEvent.isEventHandlingSuppressed = this.isSuppressMouseEvent(mouseEvent);
        this.beans.eventSvc.dispatchEvent(rowEvent);
    }

    public findInfoForEvent(event?: Event): { column: AgColumn; pinned: ColumnPinnedType } | undefined {
        return this.rowModeFeature.findInfoForEvent?.(event);
    }

    public getTargets(): FullWidthTarget[] {
        return this.rowModeFeature.getTargets?.() ?? [];
    }

    public getTarget(element?: EventTarget | null): FullWidthTarget | undefined {
        return this.rowModeFeature.getTarget?.(element);
    }

    private onRowMouseDown(mouseEvent: MouseEvent) {
        this.lastMouseDownOnDragger = _isElementChildOfClass(mouseEvent.target as HTMLElement, 'ag-row-drag', 3);
        this.rowModeFeature.onRowMouseDown?.(mouseEvent);
    }

    public isSuppressMouseEvent(mouseEvent: MouseEvent): boolean {
        return this.rowModeFeature.isSuppressMouseEvent(mouseEvent);
    }

    public onRowClick(mouseEvent: MouseEvent) {
        const stop = _isStopPropagationForAgGrid(mouseEvent) || this.lastMouseDownOnDragger;

        if (stop) {
            return;
        }

        const isSuppressMouseEvent = this.isSuppressMouseEvent(mouseEvent);

        const { eventSvc, selectionSvc } = this.beans;
        const rowEvent = this.createRowEventWithSource('rowClicked', mouseEvent) as RowClickedEvent;
        rowEvent.isEventHandlingSuppressed = isSuppressMouseEvent;
        eventSvc.dispatchEvent(rowEvent);

        if (isSuppressMouseEvent) {
            return;
        }

        selectionSvc?.handleSelectionEvent(mouseEvent, this.rowNode, 'rowClicked');
    }

    public setupDetailRowAutoHeight(eDetailGui: HTMLElement): void {
        this.rowModeFeature.setupDetailRowAutoHeight?.(eDetailGui);
    }

    private onUiLevelChanged(): void {
        const newLevel = calculateRowLevel(this.rowNode);
        if (this.rowLevel != newLevel) {
            const classToAdd = 'ag-row-level-' + newLevel;
            const classToRemove = 'ag-row-level-' + this.rowLevel;
            this.rowGui?.rowComp.toggleCss(classToAdd, true);
            this.rowGui?.rowComp.toggleCss(classToRemove, false);
        }
        this.rowLevel = newLevel;
    }

    private isFirstRowOnPage(): boolean {
        const {
            rowNode: { rowIndex, rowPinned },
            beans: { pageBounds },
        } = this;

        if (rowPinned) {
            return rowIndex === 0;
        }
        return rowIndex === pageBounds.getFirstRow();
    }

    private isLastRowOnPage(): boolean {
        const {
            rowNode: { rowIndex, rowPinned },
            beans: { pageBounds, pinnedRowModel },
        } = this;

        if (rowPinned) {
            const rowCount =
                rowPinned === 'top'
                    ? pinnedRowModel?.getPinnedTopRowCount()
                    : pinnedRowModel?.getPinnedBottomRowCount();
            if (rowCount == null) {
                return false;
            }
            return rowIndex === rowCount - 1;
        }
        return rowIndex === pageBounds.getLastRow();
    }

    protected refreshFirstAndLastRowStyles(): void {
        const newFirst = this.isFirstRowOnPage();
        const newLast = this.isLastRowOnPage();

        if (this.firstRowOnPage !== newFirst) {
            this.firstRowOnPage = newFirst;
            this.rowGui?.rowComp.toggleCss('ag-row-first', newFirst);
        }
        if (this.lastRowOnPage !== newLast) {
            this.lastRowOnPage = newLast;
            this.rowGui?.rowComp.toggleCss('ag-row-last', newLast);
        }
    }

    public getAllCellCtrls(): CellCtrl[] {
        return this.rowModeFeature.getAllCellCtrls();
    }

    private postProcessClassesFromGridOptions(): void {
        const cssClasses: string[] = [];
        this.beans.rowStyleSvc?.processClassesFromGridOptions(cssClasses, this.rowNode);
        if (!cssClasses.length) {
            return;
        }

        for (const classStr of cssClasses) {
            this.rowGui?.rowComp.toggleCss(classStr, true);
        }
    }

    private postProcessRowClassRules(): void {
        this.beans.rowStyleSvc?.processRowClassRules(
            this.rowNode,
            (className: string) => this.rowGui?.rowComp.toggleCss(className, true),
            (className: string) => this.rowGui?.rowComp.toggleCss(className, false)
        );
    }

    private setStylesFromGridOptions(updateStyles: boolean): void {
        if (updateStyles) {
            this.rowStyles = this.processStylesFromGridOptions();
        }
        this.rowGui?.rowComp.setUserStyles(this.rowStyles);
    }

    protected getInitialRowClasses(): string[] {
        const { rowNode, beans } = this;

        const classes: string[] = [];

        classes.push('ag-row');
        classes.push(this.rowFocused ? 'ag-row-focus' : 'ag-row-no-focus');

        if (this.fadeInAnimation) {
            classes.push('ag-opacity-zero');
        }

        classes.push(rowNode.rowIndex! % 2 === 0 ? 'ag-row-even' : 'ag-row-odd');

        if (rowNode.isRowPinned()) {
            classes.push('ag-row-pinned');
            if (beans.pinnedRowModel?.isManual()) {
                classes.push('ag-row-pinned-manual');
            }
        }

        // Only the source of the pinned row gets this class
        if (!rowNode.isRowPinned() && rowNode.pinnedSibling) {
            classes.push('ag-row-pinned-source');
        }

        if (rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }

        if (rowNode.footer) {
            classes.push('ag-row-footer');
        }

        classes.push('ag-row-level-' + this.rowLevel);

        if (rowNode.stub) {
            classes.push('ag-row-loading');
        }

        this.rowModeFeature.addInitialRowClasses?.(classes);

        beans.expansionSvc?.addExpandedCss(classes, rowNode);

        if (rowNode.dragging) {
            classes.push('ag-row-dragging');
        }

        const { rowStyleSvc } = beans;
        if (rowStyleSvc) {
            rowStyleSvc.processClassesFromGridOptions(classes, rowNode);
            rowStyleSvc.preProcessRowClassRules(classes, rowNode);
        }

        // we use absolute position unless we are doing print layout
        classes.push(this.printLayout ? 'ag-row-position-relative' : 'ag-row-position-absolute');

        if (this.isFirstRowOnPage()) {
            classes.push('ag-row-first');
        }

        if (this.isLastRowOnPage()) {
            classes.push('ag-row-last');
        }

        return classes;
    }

    private processStylesFromGridOptions(): RowStyle {
        // Return constant reference for React
        return this.beans.rowStyleSvc?.processStylesFromGridOptions(this.rowNode) ?? this.emptyStyle;
    }

    private onRowSelected(): void {
        this.beans.selectionSvc?.onRowCtrlSelected(this, () => this.announceDescription());
    }

    public announceDescription(cellCtrl?: CellCtrl): void {
        this.beans.selectionSvc?.announceAriaRowSelection(this.rowNode);
        this.announceNoteDescription(cellCtrl);
    }

    private announceNoteDescription(cellCtrl?: CellCtrl): void {
        const { notesSvc, ariaAnnounce } = this.beans;
        if (!notesSvc || !ariaAnnounce || (!cellCtrl && !this.isFullWidth())) {
            return;
        }

        const baseParams = { rowNode: this.rowNode };
        const suffixParams = cellCtrl ? { column: cellCtrl.column } : { location: 'fullWidthRow' };
        const params = { ...baseParams, ...suffixParams } as GetNoteParams;

        const access = notesSvc.getNoteAccess(params);

        if (access?.canView) {
            const translate = this.getLocaleTextFunc();
            ariaAnnounce.announceValue(translate('ariaHasNote', 'This cell has a note.'), 'note');
        }
    }

    protected addHoverFunctionality(eGui: RowGui): void {
        // because we use animation frames to do this, it's possible the row no longer exists
        // by the time we get to add it
        if (!this.active) {
            return;
        }

        // because mouseenter and mouseleave do not propagate, we cannot listen on the gridPanel
        // like we do for all the other mouse events.

        // hover state is tracked on the rowNode so the row stays consistent across re-renders.

        const { element, compBean } = eGui;
        const { rowNode, beans, gos } = this;
        // step 1 - add listener, to set flag on row node
        compBean.addManagedListeners(element, {
            // We use pointer events here instead of mouse events, as pointer events
            // are more reliable for hover detection, especially with touch devices
            // or hybrid touch + mouse devices.
            pointerenter: (e: PointerEvent) => {
                if (e.pointerType === 'mouse') {
                    rowNode.dispatchRowEvent('mouseEnter');
                }
            },
            pointerleave: (e: PointerEvent) => {
                if (e.pointerType === 'mouse') {
                    rowNode.dispatchRowEvent('mouseLeave');
                }
            },
        });

        // step 2 - listen for changes on row node (which any element can trigger)
        compBean.addManagedListeners(rowNode, {
            mouseEnter: () => {
                // if hover turned off, we don't add the class. we do this here so that if the application
                // toggles this property mid way, we remove the hover form the last row, but we stop
                // adding hovers from that point onwards. Also, do not highlight while dragging elements around.
                if (!beans.dragSvc?.dragging && !gos.get('suppressRowHoverHighlight')) {
                    element.classList.add('ag-row-hover');
                    rowNode.setHovered(true);
                }
            },
            mouseLeave: () => {
                this.resetHoveredStatus(element);
            },
        });
    }

    public resetHoveredStatus(el?: HTMLElement): void {
        const target = el ?? this.rowGui?.element;

        target?.classList.remove('ag-row-hover');
        this.rowNode.setHovered(false);
    }

    public getGui(): RowGui | undefined {
        return this.rowGui;
    }

    // for animation, we don't want to animate entry or exit to a very far away pixel,
    // otherwise the row would move so fast, it would appear to disappear. so this method
    // moves the row closer to the viewport if it is far away, so the row slide in / out
    // at a speed the user can see.
    private roundRowTopToBounds(rowTop: number): number {
        const range = this.beans.ctrlsSvc.getScrollFeature().getApproximateVScollPosition();
        const minPixel = this.applyPaginationOffset(range.top, true) - 100;
        const maxPixel = this.applyPaginationOffset(range.bottom, true) + 100;

        return _clamp(rowTop, minPixel, maxPixel);
    }

    public isRowRendered() {
        return !!this.rowGui;
    }

    protected onRowHeightChanged(): void {
        // check for exists first - if the user is resetting the row height, then
        // it will be null (or undefined) momentarily until the next time the flatten
        // stage is called where the row will then update again with a new height
        if (this.rowNode.rowHeight == null) {
            return;
        }

        const rowHeight = this.rowNode.rowHeight;

        const defaultRowHeight = this.beans.environment.getDefaultRowHeight();
        const isHeightFromFunc = _isGetRowHeightFunction(this.gos);
        const heightFromFunc = isHeightFromFunc ? _getRowHeightForNode(this.beans, this.rowNode).height : undefined;
        const lineHeight = heightFromFunc ? `${Math.min(defaultRowHeight, heightFromFunc) - 2}px` : undefined;

        this.rowGui?.element.style.setProperty('height', `${rowHeight}px`);

        // If the row height is coming from a function, this means some rows can
        // be smaller than the theme had intended. so we set --ag-line-height on
        // the row, which is picked up by the theme CSS and is used in a calc
        // for the CSS line-height property, which makes sure the line-height is
        // not bigger than the row height, otherwise the row text would not fit.
        // We do not use rowNode.rowHeight here, as this could be the result of autoHeight,
        // and we found using the autoHeight result causes a loop, where changing the
        // line-height them impacts the cell height, resulting in a new autoHeight,
        // resulting in a new line-height and so on loop.
        // const heightFromFunc = getRowHeightForNode(this.gos, this.rowNode).height;
        if (lineHeight) {
            this.rowGui?.element.style.setProperty('--ag-line-height', lineHeight);
        }
    }

    // note - this is NOT called by context, as we don't wire / unwire the CellComp for performance reasons.
    public destroyFirstPass(suppressAnimation: boolean = false): void {
        this.active = false;

        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?

        const { rowNode } = this;

        if (!suppressAnimation && _isAnimateRows(this.gos) && !rowNode.sticky) {
            const rowStillVisibleJustNotInViewport = rowNode.rowTop != null;
            if (rowStillVisibleJustNotInViewport) {
                // if the row is not rendered, but in viewport, it means it has moved,
                // so we animate the row out. if the new location is very far away,
                // the animation will be so fast the row will look like it's just disappeared,
                // so instead we animate to a position just outside the viewport.
                const rowTop = this.roundRowTopToBounds(rowNode.rowTop!);
                this.setRowTop(rowTop);
            } else {
                this.rowGui?.rowComp.toggleCss('ag-opacity-zero', true);
            }
        }

        // if this was focused; focus will need recovered
        if (this.isFullWidth() && this.rowGui?.element.contains(_getActiveDomElement(this.beans))) {
            this.beans.focusSvc.attemptToRecoverFocus();
        }

        rowNode.setHovered(false);

        const event: VirtualRowRemovedEvent = this.createRowEvent('virtualRowRemoved');

        this.dispatchLocalEvent(event);
        this.beans.eventSvc.dispatchEvent(event);
        super.destroy();
    }

    public destroySecondPass(): void {
        this.rowGui = undefined;
        this.rowModeFeature.destroyCells();
    }

    private setFocusedClasses(): void {
        const { rowGui } = this;

        rowGui?.rowComp.toggleCss('ag-row-focus', this.rowFocused);
        rowGui?.rowComp.toggleCss('ag-row-no-focus', !this.rowFocused);
    }

    private onCellFocusChanged(): void {
        const { focusSvc } = this.beans;
        const rowFocused = focusSvc.isRowFocused(this.rowNode.rowIndex!, this.rowNode.rowPinned);

        if (rowFocused !== this.rowFocused) {
            this.rowFocused = rowFocused;
            this.setFocusedClasses();
        }
    }

    private onPinnedRowsChanged(): void {
        this.updateRowIndexes();
        this.refreshFirstAndLastRowStyles();
    }

    private onPaginationChanged(): void {
        const currentPage = this.beans.pagination?.getCurrentPage() ?? 0;
        // it is possible this row is in the new page, but the page number has changed, which means
        // it needs to reposition itself relative to the new page
        if (this.paginationPage !== currentPage) {
            this.paginationPage = currentPage;
            this.onTopChanged();
        }

        this.refreshFirstAndLastRowStyles();
    }

    private onTopChanged(): void {
        const rowTop = this.getCalculatedRowTop();
        if (!_exists(rowTop)) {
            return;
        }
        this.setRowTop(rowTop);
    }

    private onPaginationPixelOffsetChanged(): void {
        // the pixel offset is used when calculating rowTop to set on the row DIV
        this.onTopChanged();
    }

    private onStickyBottomOffsetChanged(): void {
        if (this.rowNode.rowPinned !== 'bottom') {
            return;
        }
        this.onTopChanged();
    }

    /**
     * Applies pagination offset, eg if on second page, and page height is 500px, then removes
     * 500px from the top position, so a row with rowTop 600px is displayed at location 100px.
     * reverse will take the offset away rather than add.
     */
    private applyPaginationOffset(topPx: number, reverse = false): number {
        if (this.rowNode.isRowPinned() || this.rowNode.sticky) {
            return topPx;
        }

        const pixelOffset = this.beans.pageBounds.getPixelOffset();
        const multiplier = reverse ? 1 : -1;

        return topPx + pixelOffset * multiplier;
    }

    public setRowTop(pixels: number): void {
        if (this.printLayout) {
            return;
        }
        if (!_exists(pixels)) {
            return;
        }
        this.setRowTopStyle(`${this.calculateRowTopPx(pixels)}px`);
    }

    /**
     * Applies pagination offset and pixel scaling to produce final top position.
     * Rows are positioned relative to their container, not the section.
     */
    private calculateRowTopPx(pixels: number): number {
        const {
            rowNode,
            beans: { rowContainerHeight },
        } = this;
        const afterPagination = this.applyPaginationOffset(pixels);
        const skipScaling = rowNode.isRowPinned() || rowNode.sticky;
        return skipScaling ? afterPagination : rowContainerHeight.getRealPixelPosition(afterPagination);
    }

    /**
     * The top needs to be set into the DOM element when the element is created, not updated afterwards.
     * otherwise the transition would not work, as it would be transitioning from zero (the unset value).
     * for example, suppose a row that is outside the viewport, then user does a filter to remove other rows
     * and this row now appears in the viewport, and the row moves up (ie it was under the viewport and not rendered,
     * but now is in the viewport) then a new RowComp is created, however it should have it's position initialised
     * to below the viewport, so the row will appear to animate up. if we didn't set the initial position at creation
     * time, the row would animate down (ie from position zero).
     */
    public getInitialRowTop(): string | undefined {
        return this.suppressRowTransform ? this.getInitialRowTopShared() : undefined;
    }
    public getInitialTransform(): string | undefined {
        return this.suppressRowTransform ? undefined : `translateY(${this.getInitialRowTopShared()})`;
    }
    private getInitialRowTopShared(): string {
        if (this.printLayout) {
            return '';
        }

        const { rowNode } = this;
        let pixels: number;

        if (rowNode.sticky) {
            const calculatedRowTop = this.getCalculatedRowTop();
            pixels = _exists(calculatedRowTop) ? calculatedRowTop : rowNode.stickyRowTop;
        } else {
            pixels = this.slideInAnimation ? this.roundRowTopToBounds(rowNode.oldRowTop!) : rowNode.rowTop!;
        }

        return `${this.calculateRowTopPx(pixels)}px`;
    }

    private getCalculatedRowTop(): number | null | undefined {
        const { sticky, rowTop, stickyRowTop } = this.rowNode;
        if (!sticky) {
            return rowTop;
        }
        return stickyRowTop;
    }

    private setRowTopStyle(topPx: string): void {
        const { rowGui, suppressRowTransform } = this;

        if (!rowGui) {
            return;
        }

        if (suppressRowTransform) {
            rowGui.rowComp.setTop(topPx);
        } else {
            rowGui.rowComp.setTransform(`translateY(${topPx})`);
        }
    }

    public getCellCtrl(column: AgColumn, skipColSpanSearch = false): CellCtrl | null {
        // first up, check for cell directly linked to this column
        let res: CellCtrl | null = null;
        for (const cellCtrl of this.getAllCellCtrls()) {
            if (cellCtrl.column == column) {
                res = cellCtrl;
            }
        }

        if (res != null || skipColSpanSearch) {
            return res;
        }

        // second up, if not found, then check for spanned cols.
        // we do this second (and not at the same time) as this is
        // more expensive, as spanning cols is a
        // infrequently used feature so we don't need to do this most
        // of the time
        for (const cellCtrl of this.getAllCellCtrls()) {
            if (cellCtrl?.getColSpanningList().indexOf(column) >= 0) {
                res = cellCtrl;
            }
        }

        return res;
    }

    protected onRowIndexChanged(): void {
        // we only bother updating if the rowIndex is present. if it is not present, it means this row
        // is child of a group node, and the group node was closed, it's the only way to have no row index.
        // when this happens, row is about to be de-rendered, so we don't care, rowComp is about to die!
        if (this.rowNode.rowIndex != null) {
            this.onCellFocusChanged();
            this.updateRowIndexes();
            this.postProcessCss();
        }
    }

    private updateRowIndexes(): void {
        const { rowNode, rowGui, beans } = this;

        const { rowIndex } = rowNode;
        if (rowIndex == null) {
            return;
        }

        const rowIndexStr = rowNode.getRowIndexString();

        if (rowIndexStr === null) {
            return;
        }

        const rowPosition: RowPosition = {
            rowIndex,
            rowPinned: this.rowNode.rowPinned ?? null,
        };

        const absoluteRowIndex = _getAbsoluteRowIndex(beans, rowPosition);
        const rowIsEven = rowIndex % 2 === 0;
        const ariaRowIndex = (this.ariaRowIndex = getAriaHeaderRowCount(beans) + absoluteRowIndex + 1);

        if (rowGui) {
            rowGui?.rowComp.setRowIndex(rowIndexStr);
            rowGui?.rowComp.toggleCss('ag-row-even', rowIsEven);
            rowGui?.rowComp.toggleCss('ag-row-odd', !rowIsEven);

            _setAriaRowIndex(rowGui.element, ariaRowIndex);
        }
    }
}

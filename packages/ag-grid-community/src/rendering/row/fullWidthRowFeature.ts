import { _findNextFocusableElement, _getActiveDomElement, _isBrowserSafari, _isFocusableFormField } from 'ag-stack';

import { ComponentInstanceGuard } from '../../components/framework/componentInstanceGuard';
import {
    _getFullWidthCellRendererDetails,
    _getFullWidthDetailCellRendererDetails,
    _getFullWidthGroupCellRendererDetails,
    _getFullWidthLoadingCellRendererDetails,
} from '../../components/framework/userCompUtils';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { ColDef } from '../../entities/colDef';
import type { RowNode } from '../../entities/rowNode';
import type { CellFocusedEvent } from '../../events';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { RefreshRowsParams } from '../../interfaces/iCellsParams';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { WithoutGridCommon } from '../../interfaces/iCommon';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { INotesFeature } from '../../interfaces/notes';
import type { TooltipCallbackParams } from '../../tooltip/tooltipComponent';
import type { TooltipFeature, TooltipSource, TooltipSourceParams } from '../../tooltip/tooltipFeature';
import { _getCellTooltipComponentDefinition } from '../../tooltip/tooltipFeature';
import {
    _getLegacyTooltipFieldValue,
    _isCellTooltipConfigured,
    _resolveGroupTooltipValue,
} from '../../tooltip/tooltipValueUtils';
import { _isStopPropagationForAgGrid } from '../../utils/gridEvent';
import type { CellCtrl } from '../cell/cellCtrl';
import type { ICellRenderer, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import { _suppressFullWidthMouseEvent } from '../renderUtils';
import type { FullWidthTarget, IRowModeFeature } from './iRowModeFeature';
import type { RowCtrl } from './rowCtrl';

export class FullWidthRowFeature extends BeanStub implements IRowModeFeature {
    private readonly tooltipFeatures = new Map<HTMLElement, TooltipFeature>();
    private readonly rendererGuards = new Map<HTMLElement, ComponentInstanceGuard>();
    private notesFeature: INotesFeature | undefined;
    private focusEventWhileNotReady: CellFocusedEvent | null = null;

    public constructor(private readonly rowCtrl: RowCtrl) {
        super();
    }

    public initialiseComp(): void {
        const rowComp = this.rowCtrl.getCurrentRowComp();
        const eRow = this.rowCtrl.getCurrentRowElement();
        if (!rowComp || !eRow) {
            return;
        }

        this.pruneStaleTooltipElements();

        if (this.shouldCreateCellSections() && rowComp.showEmbeddedFullWidth) {
            this.rowCtrl.isEmbeddedFullWidth = true;
            this.rowCtrl.embeddedSectionHasContent = { left: true, center: true, right: true };
            rowComp.showEmbeddedFullWidth({
                left: this.createFullWidthCompDetails(rowComp.getPinnedLeftRowElement() ?? eRow, 'left', true),
                center: this.createFullWidthCompDetails(rowComp.getScrollingRowElement() ?? eRow, null, true),
                right: this.createFullWidthCompDetails(rowComp.getPinnedRightRowElement() ?? eRow, 'right', true),
            });
            this.rowCtrl.refreshPinnedCellGroupWidths();
        } else {
            this.rowCtrl.isEmbeddedFullWidth = false;
            const compDetails = this.createFullWidthCompDetails(eRow, null, true);
            rowComp.showFullWidth(compDetails);
            this.rowCtrl.refreshPinnedCellGroupWidths();
        }

        // Create notes feature after component is attached — creation triggers initialise() → refresh()
        this.notesFeature = this.beans.notesSvc?.createFullWidthNotesFeature(this.rowCtrl);
    }

    public refreshRow(_params: RefreshRowsParams): void {
        if (!this.refreshFullWidthComp()) {
            this.rowCtrl.redrawThisRow();
            return;
        }

        this.notesFeature?.refresh();
    }

    private refreshFullWidthComp(): boolean {
        const rowComp = this.rowCtrl.getCurrentRowComp();
        const eRow = this.rowCtrl.getCurrentRowElement();
        if (!rowComp || !eRow) {
            return true;
        }

        this.pruneStaleTooltipElements();

        if (this.shouldCreateCellSections() && rowComp.refreshEmbeddedFullWidth) {
            return rowComp.refreshEmbeddedFullWidth((pinned) => {
                const eSectionRow =
                    pinned === 'left'
                        ? rowComp.getPinnedLeftRowElement()
                        : pinned === 'right'
                          ? rowComp.getPinnedRightRowElement()
                          : rowComp.getScrollingRowElement();
                return this.createFullWidthCompDetails(eSectionRow ?? eRow, pinned).params;
            });
        }

        return rowComp.refreshFullWidth(() => this.createFullWidthCompDetails(eRow, null).params);
    }

    public shouldCreateCellSections(): boolean {
        return this.rowCtrl.printLayout || this.gos.get('embedFullWidthRows');
    }

    public getModeCellRenderers(): (ICellRenderer | null | undefined)[] {
        return this.rowCtrl.getCurrentRowComp()?.getFullWidthCellRenderers() ?? [];
    }

    public getAllCellCtrls(): CellCtrl[] {
        return [];
    }

    public recreateCell(_cellCtrl: CellCtrl): void {
        // no-op: full-width rows have no individual cell ctrls
    }

    public destroyCells(): void {
        // no-op: full-width rows have no individual cell ctrls
    }

    public onDisplayedColumnsChanged(): void {
        this.notesFeature?.refresh();
    }

    public onVirtualColumnsChanged(): void {}

    public onColumnMoved(): void {
        this.notesFeature?.refresh();
    }

    public onSpannedCellsUpdated(_pinned: ColumnPinnedType): void {}

    public createFullWidthCompDetails(eRow: HTMLElement, pinned: ColumnPinnedType, adopt = false): UserCompDetails {
        const { rowCtrl } = this;
        const { gos } = this;
        const { rowNode } = rowCtrl;
        const rendererClaim = this.claimRenderer(eRow, adopt);
        const params = _addGridCommonParams<ICellRendererParams>(gos, {
            fullWidth: true,
            data: rowNode.data,
            node: rowNode,
            value: rowNode.key,
            valueFormatted: rowNode.key,
            // these need to be taken out, as part of 'afterAttached' now
            eGridCell: eRow,
            eParentOfValue: eRow,
            pinned: pinned as any,
            addRenderedRowListener: rowCtrl.addEventListener.bind(rowCtrl) as any,
            registerRowDragger: (rowDraggerElement, dragStartPixels, value, rowDragEntireRow) =>
                this.addFullWidthRowDragging(rowDraggerElement, dragStartPixels, value, rowDragEntireRow),
            setTooltip: (value, shouldDisplayTooltip) => {
                gos.assertModuleRegistered('Tooltip', 3);
                if (this.isAlive() && rendererClaim.isCurrent()) {
                    this.setRendererTooltip(eRow, rowNode, value, shouldDisplayTooltip);
                }
            },
        } as WithoutGridCommon<ICellRendererParams>);

        const compFactory = this.beans.userCompFactory;
        switch (rowCtrl.getRowType()) {
            case 'FullWidthDetail':
                return _getFullWidthDetailCellRendererDetails(compFactory, params)!;
            case 'FullWidthGroup': {
                const { value, valueFormatted } = this.beans.valueSvc.getValueForDisplay({
                    node: rowNode,
                    includeValueFormatted: true,
                    from: 'edit',
                });
                params.value = value;
                params.valueFormatted = valueFormatted;
                this.setupGroupRowsTooltip(rowNode, eRow);
                return _getFullWidthGroupCellRendererDetails(compFactory, params)!;
            }
            case 'FullWidthLoading':
                return _getFullWidthLoadingCellRendererDetails(compFactory, params)!;
            default:
                return _getFullWidthCellRendererDetails(compFactory, params)!;
        }
    }

    public setupDetailRowAutoHeight(eDetailGui: HTMLElement): void {
        if (this.rowCtrl.getRowType() !== 'FullWidthDetail') {
            return;
        }
        this.beans.masterDetailSvc?.setupDetailRowAutoHeight(this.rowCtrl, eDetailGui);
    }

    private setupFullWidthRowTooltip(
        eGui: HTMLElement,
        getTooltipValue: () => any,
        shouldDisplayTooltip?: () => boolean,
        getAdditionalParams?: () => TooltipSourceParams,
        getTooltipComponentDefinition: () => ColDef | undefined = () => undefined
    ) {
        const tooltipSvc = this.beans.tooltipSvc;
        if (!tooltipSvc || !this.rowCtrl.getCurrentRowElement()) {
            return;
        }

        const source: TooltipSource = {
            getGui: () => eGui,
            getTooltipComponentDefinition,
            getTooltipValue,
            getLocation: () => 'fullWidthRow',
            shouldDisplayTooltip,
            ...(getAdditionalParams ? { getAdditionalParams } : {}),
        };
        const feature = tooltipSvc.registerTooltip(this, source, this.tooltipFeatures.get(eGui));
        if (feature) {
            this.tooltipFeatures.set(eGui, feature);
        } else {
            this.tooltipFeatures.delete(eGui);
        }
    }

    private setRendererTooltip(
        eGui: HTMLElement,
        rowNode: RowNode,
        value: string,
        shouldDisplayTooltip?: () => boolean
    ): void {
        const isGroupRow = this.rowCtrl.getRowType() === 'FullWidthGroup';
        if (value == null) {
            this.clearTooltip(eGui);
            if (isGroupRow) {
                this.setupGroupRowsTooltip(rowNode, eGui);
            }
            return;
        }
        // Renderer-supplied tooltips are not gated by `tooltip: false`, so pass the colDef ungated.
        const groupCol = isGroupRow ? (rowNode.rowGroupColumn as AgColumn | undefined) : undefined;
        const colDef = isGroupRow ? this.getGroupColDef(rowNode) : undefined;
        this.setupFullWidthRowTooltip(
            eGui,
            () => value,
            shouldDisplayTooltip,
            () => ({
                colDef,
                column: groupCol,
                rowIndex: rowNode.rowIndex ?? 0,
                node: rowNode,
                data: rowNode.data,
            }),
            () => colDef
        );
    }

    private clearTooltip(eGui: HTMLElement): void {
        const feature = this.tooltipFeatures.get(eGui);
        if (feature) {
            this.destroyBean(feature, this.beans.context);
        }
        this.tooltipFeatures.delete(eGui);
    }

    /**
     * `adopt` claims for a freshly mounted renderer, superseding earlier ones. A refresh claims
     * provisionally: the surviving renderer's earlier params must keep working when it is kept in place.
     */
    private claimRenderer(eGui: HTMLElement, adopt: boolean) {
        let guard = this.rendererGuards.get(eGui);
        if (!guard) {
            guard = new ComponentInstanceGuard();
            this.rendererGuards.set(eGui, guard);
        }
        return adopt ? guard.claim() : guard.provisionalClaim();
    }

    /** Drop tooltip state keyed to elements the row no longer renders into (e.g. after a remount). */
    private pruneStaleTooltipElements(): void {
        const { tooltipFeatures, rendererGuards, rowCtrl } = this;
        if (tooltipFeatures.size === 0 && rendererGuards.size === 0) {
            return;
        }

        const rowComp = rowCtrl.getCurrentRowComp();
        const currentElements = new Set<HTMLElement | undefined>([
            rowCtrl.getCurrentRowElement() ?? undefined,
            rowComp?.getPinnedLeftRowElement(),
            rowComp?.getScrollingRowElement(),
            rowComp?.getPinnedRightRowElement(),
        ]);

        for (const [element, feature] of tooltipFeatures) {
            if (!currentElements.has(element)) {
                this.destroyBean(feature, this.beans.context);
                tooltipFeatures.delete(element);
            }
        }
        for (const [element, guard] of rendererGuards) {
            if (!currentElements.has(element)) {
                guard.invalidate();
                rendererGuards.delete(element);
            }
        }
    }

    /**
     * Regular row grouping: read tooltip config from the row-group column's colDef.
     * Tree data (no rowGroupColumn): fall back to the auto-group column def.
     */
    private getGroupColDef(rowNode: RowNode): ColDef | undefined {
        const groupCol = rowNode.rowGroupColumn as AgColumn | undefined;
        return groupCol?.colDef ?? this.gos.get('autoGroupColumnDef');
    }

    /** Resolves a full-width group tooltip lazily from its owning group column or tree-data auto column. */
    private setupGroupRowsTooltip(rowNode: RowNode, eGui: HTMLElement): void {
        const groupCol = rowNode.rowGroupColumn as AgColumn | undefined;
        const { gos } = this;

        const colDef = this.getGroupColDef(rowNode);
        if (!colDef) {
            this.clearTooltip(eGui);
            return;
        }

        const hasTooltipValue = _isCellTooltipConfigured(colDef);
        const hasLegacyComponentOnlyTooltip =
            colDef.tooltip !== false &&
            !hasTooltipValue &&
            !!(colDef.tooltipComponent || colDef.tooltipComponentSelector);
        if (!hasTooltipValue && !hasLegacyComponentOnlyTooltip) {
            this.clearTooltip(eGui);
            return;
        }

        const { valueSvc } = this.beans;
        gos.assertModuleRegistered('Tooltip', 3);

        let latestValueFormatted: string | null | undefined;
        const getDisplay = () => {
            const display = valueSvc.getValueForDisplay({ node: rowNode, includeValueFormatted: true, from: 'edit' });
            latestValueFormatted = display.valueFormatted;
            return display;
        };

        this.setupFullWidthRowTooltip(
            eGui,
            () => {
                const { value, valueFormatted } = getDisplay();
                const callbackParams = _addGridCommonParams<TooltipCallbackParams>(gos, {
                    location: 'fullWidthRow' as const,
                    colDef,
                    column: groupCol,
                    rowIndex: rowNode.rowIndex ?? 0,
                    node: rowNode,
                    data: rowNode.data,
                    value,
                    valueFormatted: valueFormatted ?? undefined,
                });
                if (hasTooltipValue) {
                    return _resolveGroupTooltipValue(colDef, callbackParams, () => {
                        const tooltipField = colDef.tooltipField;
                        if (!tooltipField) {
                            return { resolved: false };
                        }
                        const data = rowNode.data;
                        if (!data) {
                            // Regular row-grouping group nodes carry no `data`; use the group display value.
                            return { resolved: true, value };
                        }
                        const containsDots = groupCol
                            ? groupCol.tooltipFieldContainsDots
                            : !gos.get('suppressFieldDotNotation') && tooltipField.includes('.');
                        return {
                            resolved: true,
                            value: _getLegacyTooltipFieldValue(data, tooltipField, containsDots),
                        };
                    });
                }
                return value;
            },
            undefined,
            () => ({
                colDef,
                column: groupCol,
                rowIndex: rowNode.rowIndex ?? 0,
                node: rowNode,
                data: rowNode.data,
                valueFormatted: latestValueFormatted ?? undefined,
            }),
            () => _getCellTooltipComponentDefinition(colDef)
        );
    }

    private addFullWidthRowDragging(
        rowDraggerElement?: HTMLElement,
        dragStartPixels?: number,
        value: string = '',
        alwaysVisible?: boolean
    ): void {
        const { rowDragSvc, context } = this.beans;
        if (!rowDragSvc) {
            return;
        }

        const rowDragComp = rowDragSvc.createRowDragComp(
            () => value,
            this.rowCtrl.rowNode,
            undefined,
            rowDraggerElement,
            dragStartPixels,
            alwaysVisible
        );
        this.createBean(rowDragComp, context);

        this.addDestroyFunc(() => {
            this.destroyBean(rowDragComp, context);
        });
    }

    public setupFocus(): void {
        this.restoreFullWidthFocus(true);
        this.onRowFocused(this.focusEventWhileNotReady ?? undefined);
    }

    private restoreFullWidthFocus(waitForRender = false): void {
        const { focusSvc, editSvc } = this.beans;
        const { rowCtrl } = this;
        if (editSvc?.isEditing(rowCtrl)) {
            return;
        }

        if (
            !focusSvc.isRowFocused(rowCtrl.rowNode.rowIndex!, rowCtrl.rowNode.rowPinned) ||
            !focusSvc.shouldTakeFocus()
        ) {
            return;
        }

        const element = rowCtrl.getCurrentRowElement();
        if (!element) {
            return;
        }

        const focus = () => {
            if (!rowCtrl.isAlive()) {
                return;
            }
            if (focusSvc.isRowFocused(rowCtrl.rowNode.rowIndex!, rowCtrl.rowNode.rowPinned)) {
                element.focus({ preventScroll: true });
            }
        };

        if (waitForRender) {
            setTimeout(focus, 0);
            return;
        }

        focus();
    }

    public onRowFocused(event?: CellFocusedEvent): void {
        const { focusSvc } = this.beans;
        const { rowCtrl } = this;
        const isFocused = focusSvc.isRowFocused(rowCtrl.rowNode.rowIndex!, rowCtrl.rowNode.rowPinned);

        const element = rowCtrl.getCurrentRowElement();

        if (!isFocused) {
            element?.classList.remove('ag-full-width-focus');
            return;
        }

        if (!element) {
            if (event) {
                this.focusEventWhileNotReady = event;
            }
            return;
        }

        element.classList.add('ag-full-width-focus');
        this.focusEventWhileNotReady = null;

        if (event?.forceBrowserFocus) {
            element.focus({ preventScroll: true });
        }
    }

    // --- Keyboard navigation ---

    public onKeyboardNavigate(keyboardEvent: KeyboardEvent): void {
        const { rowCtrl } = this;
        const element = rowCtrl.getCurrentRowElement();
        if (!element?.contains(keyboardEvent.target as HTMLElement)) {
            return;
        }
        const isFullWidthContainerFocused = element === keyboardEvent.target;

        if (!isFullWidthContainerFocused) {
            return;
        }

        const node = rowCtrl.rowNode;
        const { focusSvc, navigation } = this.beans;
        const lastFocusedCell = focusSvc.getFocusedCell();
        const cellPosition: CellPosition = {
            rowIndex: node.rowIndex!,
            rowPinned: node.rowPinned,
            column: (lastFocusedCell?.column as AgColumn) ?? this.getNavigationColumn(),
        };

        navigation?.navigateToNextCell(keyboardEvent, keyboardEvent.key, cellPosition, true);
        keyboardEvent.preventDefault();
    }

    public onTabKeyDown(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.defaultPrevented || _isStopPropagationForAgGrid(keyboardEvent)) {
            return;
        }
        const { rowCtrl, beans } = this;
        const element = rowCtrl.getCurrentRowElement();
        const currentFullWidthContainer = element?.contains(keyboardEvent.target as HTMLElement) ? element : null;
        const isFullWidthContainerFocused = currentFullWidthContainer === keyboardEvent.target;
        const activeEl = _getActiveDomElement(this.beans);
        let isDetailGridCellFocused = false;

        if (currentFullWidthContainer && activeEl) {
            isDetailGridCellFocused =
                currentFullWidthContainer.contains(activeEl) && activeEl.classList.contains('ag-cell');
        }

        let nextEl: HTMLElement | null = null;

        if (!isFullWidthContainerFocused && !isDetailGridCellFocused) {
            nextEl = _findNextFocusableElement({
                beans,
                rootNode: currentFullWidthContainer!,
                backwards: keyboardEvent.shiftKey,
            });
        }

        if (isFullWidthContainerFocused || !nextEl) {
            this.beans.navigation?.onTabKeyDown(rowCtrl, keyboardEvent);
        }
    }

    public getRowContentElement(): HTMLElement | null {
        return this.rowCtrl.getCurrentRowElement() ?? null;
    }

    public getNavigationColumn(): AgColumn {
        return this.getDefaultTarget()?.column ?? this.getFirstDisplayedColumnForFullWidth()!;
    }

    public onRowMouseDown(mouseEvent: MouseEvent): void {
        if (this.isSuppressMouseEvent(mouseEvent)) {
            return;
        }

        const { rangeSvc, focusSvc } = this.beans;
        rangeSvc?.removeAllCellRanges();

        const { rowCtrl } = this;
        const element = rowCtrl.getCurrentRowElement();
        if (!element) {
            return;
        }
        const target = mouseEvent.target as HTMLElement;
        if (!element.contains(target)) {
            return;
        }
        const column = this.getTarget(target)?.column;
        if (!column) {
            return;
        }
        const node = rowCtrl.rowNode;

        let forceBrowserFocus = mouseEvent.defaultPrevented || _isBrowserSafari();

        if (element.contains(target) && _isFocusableFormField(target)) {
            forceBrowserFocus = false;
        }

        focusSvc.setFocusedCell({
            rowIndex: node.rowIndex!,
            column,
            rowPinned: node.rowPinned,
            forceBrowserFocus,
        });
    }

    public isSuppressMouseEvent(mouseEvent: MouseEvent): boolean {
        const { rowCtrl } = this;
        const { gos } = this;
        const rowComp = rowCtrl.getCurrentRowComp();
        const element = rowCtrl.getCurrentRowElement();

        const fullWidthRowGui = element?.contains(mouseEvent.target as HTMLElement) && rowComp ? rowComp : undefined;
        const pinnedSection: ColumnPinnedType =
            fullWidthRowGui && mouseEvent.target instanceof HTMLElement
                ? fullWidthRowGui.getPinnedLeftRowElement()?.contains(mouseEvent.target)
                    ? 'left'
                    : fullWidthRowGui.getPinnedRightRowElement()?.contains(mouseEvent.target)
                      ? 'right'
                      : null
                : null;
        const fullWidthParams =
            fullWidthRowGui?.getFullWidthCellRendererParamsForPinned?.(pinnedSection) ??
            fullWidthRowGui?.getFullWidthCellRendererParams();
        return _suppressFullWidthMouseEvent(gos, fullWidthParams, rowCtrl.rowNode, mouseEvent);
    }

    public getTargets(): FullWidthTarget[] {
        const { rowCtrl } = this;
        const rowGui = rowCtrl.getGui();
        const rowComp = rowGui?.rowComp;
        const rowElement = rowGui?.element;
        const compBean = rowGui?.compBean;

        if (!rowComp || !rowElement || !compBean) {
            return [];
        }

        const ePinnedLeft = rowComp.getPinnedLeftRowElement();
        const eCenter = rowComp.getScrollingRowElement();
        const ePinnedRight = rowComp.getPinnedRightRowElement();

        if (!ePinnedLeft && !eCenter && !ePinnedRight) {
            const column = this.getFirstDisplayedColumnForFullWidth();
            return column ? [{ compBean, element: rowElement, column, pinned: null }] : [];
        }

        const targets = new Map<HTMLElement, FullWidthTarget>();
        this.addFullWidthTarget(targets, ePinnedLeft, compBean, this.getFirstColumnForFullWidthSection('left'), 'left');
        this.addFullWidthTarget(
            targets,
            eCenter ?? rowElement,
            compBean,
            this.getFirstColumnForFullWidthSection(null),
            null
        );
        this.addFullWidthTarget(
            targets,
            ePinnedRight,
            compBean,
            this.getFirstColumnForFullWidthSection('right'),
            'right'
        );

        return [...targets.values()];
    }

    public getTarget(element?: EventTarget | null): FullWidthTarget | undefined {
        const node = element instanceof Node ? element : undefined;
        const targets = this.getTargets();

        if (!targets.length) {
            return undefined;
        }

        if (!node) {
            return targets[0];
        }

        return targets.find((target) => target.element.contains(node)) ?? targets[0];
    }

    private getDefaultTarget(): FullWidthTarget | undefined {
        return this.getTargets()[0];
    }

    public findInfoForEvent(event?: Event): { column: AgColumn; pinned: ColumnPinnedType } | undefined {
        const target = this.getTarget(event?.target);
        if (!target) {
            return;
        }

        return { column: target.column, pinned: target.pinned };
    }

    private addFullWidthTarget(
        targets: Map<HTMLElement, FullWidthTarget>,
        element: HTMLElement | undefined,
        compBean: BeanStub,
        column: AgColumn | undefined,
        pinned: ColumnPinnedType
    ): void {
        if (!element || !column || targets.has(element)) {
            return;
        }

        targets.set(element, { compBean, element, column, pinned });
    }

    private getFirstColumnForFullWidthSection(pinned: ColumnPinnedType): AgColumn | undefined {
        const { visibleCols } = this.beans;
        switch (pinned) {
            case 'left':
                return visibleCols.leftCols[0] ?? visibleCols.centerCols[0] ?? visibleCols.rightCols[0];
            case 'right':
                return visibleCols.rightCols[0] ?? visibleCols.centerCols[0] ?? visibleCols.leftCols[0];
            default:
                return visibleCols.centerCols[0] ?? visibleCols.leftCols[0] ?? visibleCols.rightCols[0];
        }
    }

    private getFirstDisplayedColumnForFullWidth(): AgColumn | undefined {
        return this.beans.visibleCols.allCols[0];
    }

    public getNotesFeature() {
        return this.notesFeature;
    }

    public addInitialRowClasses(classes: string[]): void {
        classes.push('ag-full-width-row');
        if (this.shouldCreateCellSections()) {
            classes.push('ag-embedded-full-width-row');
        }
    }

    public override destroy(): void {
        const { context } = this.beans;
        for (const feature of this.tooltipFeatures.values()) {
            this.destroyBean(feature, context);
        }
        this.tooltipFeatures.clear();
        for (const guard of this.rendererGuards.values()) {
            guard.invalidate();
        }
        this.rendererGuards.clear();
        this.notesFeature?.destroy();
        this.notesFeature = undefined;
        super.destroy();
    }
}

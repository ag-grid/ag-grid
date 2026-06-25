import {
    _findNextFocusableElement,
    _getActiveDomElement,
    _getValueUsingDotField,
    _isBrowserSafari,
    _isFocusableFormField,
} from 'ag-stack';

import {
    _getFullWidthCellRendererDetails,
    _getFullWidthDetailCellRendererDetails,
    _getFullWidthGroupCellRendererDetails,
    _getFullWidthLoadingCellRendererDetails,
} from '../../components/framework/userCompUtils';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import type { CellFocusedEvent } from '../../events';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { RefreshRowsParams } from '../../interfaces/iCellsParams';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { WithoutGridCommon } from '../../interfaces/iCommon';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { INotesFeature } from '../../interfaces/notes';
import type { ITooltipCtrlParams, TooltipFeature } from '../../tooltip/tooltipFeature';
import { _isStopPropagationForAgGrid } from '../../utils/gridEvent';
import type { CellCtrl } from '../cell/cellCtrl';
import type { ICellRenderer, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import { _suppressFullWidthMouseEvent } from '../renderUtils';
import type { FullWidthTarget, IRowModeFeature } from './iRowModeFeature';
import type { RowCtrl } from './rowCtrl';

export class FullWidthRowFeature extends BeanStub implements IRowModeFeature {
    private tooltipFeature: TooltipFeature | undefined;
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

        if (this.shouldCreateCellSections() && rowComp.showEmbeddedFullWidth) {
            this.rowCtrl.isEmbeddedFullWidth = true;
            this.rowCtrl.embeddedSectionHasContent = { left: true, center: true, right: true };
            rowComp.showEmbeddedFullWidth({
                left: this.createFullWidthCompDetails(rowComp.getPinnedLeftRowElement() ?? eRow, 'left'),
                center: this.createFullWidthCompDetails(rowComp.getScrollingRowElement() ?? eRow, null),
                right: this.createFullWidthCompDetails(rowComp.getPinnedRightRowElement() ?? eRow, 'right'),
            });
            this.rowCtrl.refreshPinnedCellGroupWidths();
        } else {
            this.rowCtrl.isEmbeddedFullWidth = false;
            const compDetails = this.createFullWidthCompDetails(eRow, null);
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

    public createFullWidthCompDetails(eRow: HTMLElement, pinned: ColumnPinnedType): UserCompDetails {
        const { rowCtrl } = this;
        const { gos } = this;
        const { rowNode } = rowCtrl;
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
                this.setupFullWidthRowTooltip(() => value, shouldDisplayTooltip);
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
                this.setupGroupRowsTooltip(rowNode);
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
        getTooltipValue: () => any,
        shouldDisplayTooltip?: () => boolean,
        getAdditionalParams?: () => ITooltipCtrlParams
    ) {
        if (!this.rowCtrl.getCurrentRowElement()) {
            return;
        }

        this.tooltipFeature = this.beans.tooltipSvc?.setupFullWidthRowTooltip(
            this.tooltipFeature,
            this.rowCtrl,
            getTooltipValue,
            shouldDisplayTooltip,
            getAdditionalParams
        );
    }

    /**
     * Wires up the tooltip for a full-width group row (`groupDisplayType: 'groupRows'`), inheriting the
     * tooltip configuration from the owning group column rather than from an individual cell.
     *
     * The tooltip source colDef is the row-group column's colDef for regular grouping, or the
     * `autoGroupColumnDef` for tree data (where there is no `rowGroupColumn`). If that colDef declares no
     * `tooltipValueGetter`, `tooltipField`, or `tooltipComponent`, no tooltip is set up.
     *
     * Resolution order, mirroring the standard cell tooltip path, with values lazily computed on hover:
     * - `tooltipValueGetter` — invoked with the group's display value/formatted value and full row context.
     * - `tooltipField` — read directly from `node.data`, honouring `suppressFieldDotNotation` for dotted fields.
     * - otherwise — falls back to the group display value, also passed to any inherited `tooltipComponent`.
     */
    private setupGroupRowsTooltip(rowNode: RowNode): void {
        const groupCol = rowNode.rowGroupColumn as AgColumn | undefined;
        const { gos } = this;

        // Regular row grouping: read tooltip config from the row-group column's colDef.
        // Tree data (no rowGroupColumn): fall back to the auto-group column def.
        const colDef = groupCol?.colDef ?? gos.get('autoGroupColumnDef');
        if (!colDef) {
            return;
        }

        const { tooltipValueGetter, tooltipField, tooltipComponent } = colDef;
        if (!tooltipValueGetter && !tooltipField && !tooltipComponent) {
            return;
        }

        const { valueSvc } = this.beans;
        gos.assertModuleRegistered('Tooltip', 3);

        const getDisplay = () =>
            valueSvc.getValueForDisplay({ node: rowNode, includeValueFormatted: true, from: 'edit' });

        this.setupFullWidthRowTooltip(
            () => {
                const { value, valueFormatted } = getDisplay();
                if (tooltipValueGetter) {
                    return tooltipValueGetter(
                        _addGridCommonParams(gos, {
                            location: 'fullWidthRow',
                            colDef,
                            column: groupCol,
                            rowIndex: rowNode.rowIndex ?? 0,
                            node: rowNode,
                            data: rowNode.data,
                            value,
                            valueFormatted: valueFormatted ?? undefined,
                        })
                    );
                }
                if (tooltipField) {
                    const data = rowNode.data;
                    if (!data) {
                        // Regular row-grouping group nodes carry no `data`; fall back to the group
                        // display value, matching the auto group column's `tooltipField` behaviour.
                        return value;
                    }
                    const containsDots = groupCol
                        ? groupCol.tooltipFieldContainsDots
                        : !gos.get('suppressFieldDotNotation') && tooltipField.includes('.');
                    return containsDots
                        ? _getValueUsingDotField(data, tooltipField)
                        : (data as Record<string, unknown>)[tooltipField];
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
                valueFormatted: getDisplay().valueFormatted ?? undefined,
            })
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
        const { rowCtrl } = this;
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
            nextEl = _findNextFocusableElement(this.beans, currentFullWidthContainer!, false, keyboardEvent.shiftKey);
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
        this.tooltipFeature = this.destroyBean(this.tooltipFeature, context);
        this.notesFeature?.destroy();
        this.notesFeature = undefined;
        super.destroy();
    }
}

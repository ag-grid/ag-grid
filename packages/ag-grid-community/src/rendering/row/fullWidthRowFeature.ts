import { _isBrowserSafari } from '../../agStack/utils/browser';
import { _getActiveDomElement } from '../../agStack/utils/document';
import { _isFocusableFormField } from '../../agStack/utils/dom';
import { _findNextFocusableElement } from '../../agStack/utils/focus';
import {
    _getFullWidthCellRendererDetails,
    _getFullWidthDetailCellRendererDetails,
    _getFullWidthGroupCellRendererDetails,
    _getFullWidthLoadingCellRendererDetails,
} from '../../components/framework/userCompUtils';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { CellFocusedEvent } from '../../events';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { RefreshRowsParams } from '../../interfaces/iCellsParams';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { WithoutGridCommon } from '../../interfaces/iCommon';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { TooltipFeature } from '../../tooltip/tooltipFeature';
import { _isStopPropagationForAgGrid } from '../../utils/gridEvent';
import type { CellCtrl } from '../cell/cellCtrl';
import type { ICellRendererParams } from '../cellRenderers/iCellRenderer';
import { _suppressFullWidthMouseEvent } from '../renderUtils';
import type { IRowModeFeature } from './iRowModeFeature';
import type { RowCtrl } from './rowCtrl';

export class FullWidthRowFeature extends BeanStub implements IRowModeFeature {
    private tooltipFeature: TooltipFeature | undefined;
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
            rowComp.showEmbeddedFullWidth({
                left: this.createFullWidthCompDetails(rowComp.getPinnedLeftRowElement() ?? eRow, 'left'),
                center: this.createFullWidthCompDetails(rowComp.getScrollingRowElement() ?? eRow, null),
                right: this.createFullWidthCompDetails(rowComp.getPinnedRightRowElement() ?? eRow, 'right'),
            });
            this.rowCtrl.refreshPinnedCellGroupWidths();
            return;
        }

        const compDetails = this.createFullWidthCompDetails(eRow, null);
        rowComp.showFullWidth(compDetails);
        this.rowCtrl.refreshPinnedCellGroupWidths();
    }

    public refreshRow(_params: RefreshRowsParams): void {
        if (!this.refreshFullWidthComp()) {
            this.rowCtrl.redrawThisRow();
        }
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
        return this.rowCtrl.shouldEmbedFullWidthRowSections();
    }

    public getModeCellRenderer() {
        return this.rowCtrl.getCurrentRowComp()?.getFullWidthCellRenderer();
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

    public onDisplayedColumnsChanged(): void {}

    public onVirtualColumnsChanged(): void {}

    public onColumnMoved(): void {}

    public onSpannedCellsUpdated(_pinned: ColumnPinnedType): void {}

    // --- Full-width rendering ---

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
                this.setupFullWidthRowTooltip(value, shouldDisplayTooltip);
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

    private setupFullWidthRowTooltip(value: string, shouldDisplayTooltip?: () => boolean) {
        if (!this.rowCtrl.getCurrentRowElement()) {
            return;
        }

        this.tooltipFeature = this.beans.tooltipSvc?.setupFullWidthRowTooltip(
            this.tooltipFeature,
            this.rowCtrl,
            value,
            shouldDisplayTooltip
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

    // --- Focus ---

    public setupFocus(): void {
        this.restoreFullWidthFocus(true);
        this.onFullWidthRowFocused(this.focusEventWhileNotReady ?? undefined);
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

    public onFullWidthRowFocused(event?: CellFocusedEvent): void {
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
            column: (lastFocusedCell?.column as AgColumn) ?? this.getFullWidthColumn(),
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

    public getFullWidthElement(): HTMLElement | null {
        return this.rowCtrl.getCurrentRowElement() ?? null;
    }

    public getFullWidthNavigationColumn(): AgColumn {
        return this.getFullWidthColumn();
    }

    private getFullWidthColumn(): AgColumn {
        return this.beans.visibleCols.centerCols[0];
    }

    // --- Mouse events ---

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
        const column = this.getFullWidthColumn();
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

    public override destroy(): void {
        const { context } = this.beans;
        this.tooltipFeature = this.destroyBean(this.tooltipFeature, context);
        super.destroy();
    }
}

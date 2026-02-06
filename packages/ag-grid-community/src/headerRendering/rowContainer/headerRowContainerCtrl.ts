import type { ColumnMoveService } from '../../columnMove/columnMoveService';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import { isColumn } from '../../entities/agColumn';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import type { FocusService } from '../../focusService';
import { CenterWidthFeature } from '../../gridBodyComp/centerWidthFeature';
import type { ScrollPartner } from '../../gridBodyComp/gridBodyScrollFeature';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { HeaderPosition } from '../../interfaces/iHeaderPosition';
import type { AbstractHeaderCellCtrl } from '../cells/abstractCell/abstractHeaderCellCtrl';
import type { HeaderRowType } from '../row/headerRowComp';
import { HeaderRowCtrl } from '../row/headerRowCtrl';

export interface IHeaderRowContainerComp {
    setCenterWidth(width: string): void;
    setViewportScrollLeft(left: number): void;
    setPinnedContainerWidth(width: string): void;
    setDisplayed(displayed: boolean): void;
    setCtrls(ctrls: HeaderRowCtrl[]): void;
}

export class HeaderRowContainerCtrl extends BeanStub implements ScrollPartner {
    public comp: IHeaderRowContainerComp;
    public hidden: boolean = false;
    private includeFloatingFilter: boolean = false;

    private filtersRowCtrl: HeaderRowCtrl | undefined;
    private columnsRowCtrl: HeaderRowCtrl | undefined;
    private groupsRowCtrls: HeaderRowCtrl[] = [];
    public eViewport: HTMLElement;

    constructor(public readonly pinned: ColumnPinnedType) {
        super();
    }

    public setComp(comp: IHeaderRowContainerComp, eGui: HTMLElement): void {
        this.comp = comp;
        this.eViewport = eGui;

        const { pinnedCols, ctrlsSvc, colModel, colMoves } = this.beans;

        this.setupCenterWidth();
        pinnedCols?.setupHeaderPinnedWidth(this);

        this.setupDragAndDrop(colMoves, this.eViewport);

        const onDisplayedColsChanged = this.refresh.bind(this, true);
        this.addManagedEventListeners({
            displayedColumnsChanged: onDisplayedColsChanged,
            advancedFilterEnabledChanged: onDisplayedColsChanged,
        });

        const headerType = `${typeof this.pinned === 'string' ? this.pinned : 'center'}Header` as const;
        ctrlsSvc.register(headerType, this);

        if (colModel.ready) {
            this.refresh();
        }
    }

    public getAllCtrls(): HeaderRowCtrl[] {
        const res: HeaderRowCtrl[] = [...this.groupsRowCtrls];

        if (this.columnsRowCtrl) {
            res.push(this.columnsRowCtrl);
        }

        if (this.filtersRowCtrl) {
            res.push(this.filtersRowCtrl);
        }

        return res;
    }

    public refresh(keepColumns = false): void {
        const { focusSvc, filterManager, visibleCols } = this.beans;
        let sequence = 0;
        const focusedHeaderPosition = focusSvc.getFocusHeaderToUseAfterRefresh();

        const refreshColumnGroups = () => {
            const groupRowCount = visibleCols.headerGroupRowCount;

            sequence = groupRowCount;

            if (!keepColumns) {
                this.groupsRowCtrls = this.destroyBeans(this.groupsRowCtrls);
            }

            const currentGroupCount = this.groupsRowCtrls.length;
            if (currentGroupCount === groupRowCount) {
                return;
            }

            if (currentGroupCount > groupRowCount) {
                for (let i = groupRowCount; i < currentGroupCount; i++) {
                    this.destroyBean(this.groupsRowCtrls[i]);
                }
                this.groupsRowCtrls.length = groupRowCount;
                return;
            }

            for (let i = currentGroupCount; i < groupRowCount; i++) {
                const ctrl = this.createBean(new HeaderRowCtrl(i, this.pinned, 'group'));
                this.groupsRowCtrls.push(ctrl);
            }
        };

        const refreshColumns = () => {
            const rowIndex = sequence++;
            if (this.hidden) {
                this.columnsRowCtrl = this.destroyBean(this.columnsRowCtrl);
                return;
            }

            if (this.columnsRowCtrl == null || !keepColumns) {
                this.columnsRowCtrl = this.destroyBean(this.columnsRowCtrl);
                this.columnsRowCtrl = this.createBean(new HeaderRowCtrl(rowIndex, this.pinned, 'column'));
            } else if (this.columnsRowCtrl.rowIndex !== rowIndex) {
                this.columnsRowCtrl.setRowIndex(rowIndex);
            }
        };

        const refreshFilters = () => {
            this.includeFloatingFilter = !!filterManager?.hasFloatingFilters() && !this.hidden;

            const destroyPreviousComp = () => {
                this.filtersRowCtrl = this.destroyBean(this.filtersRowCtrl);
            };

            if (!this.includeFloatingFilter) {
                destroyPreviousComp();
                return;
            }

            if (!keepColumns) {
                destroyPreviousComp();
            }

            const rowIndex = sequence++;

            if (this.filtersRowCtrl) {
                const rowIndexMismatch = this.filtersRowCtrl.rowIndex !== rowIndex;
                if (rowIndexMismatch) {
                    this.filtersRowCtrl.setRowIndex(rowIndex);
                }
            } else {
                this.filtersRowCtrl = this.createBean(new HeaderRowCtrl(rowIndex, this.pinned, 'filter'));
            }
        };

        const oldCtrls = this.getAllCtrls();

        refreshColumnGroups();
        refreshColumns();
        refreshFilters();

        const allCtrls = this.getAllCtrls();
        this.comp.setCtrls(allCtrls);

        this.restoreFocusOnHeader(focusSvc, focusedHeaderPosition);

        if (oldCtrls.length !== allCtrls.length) {
            this.beans.eventSvc.dispatchEvent({
                type: 'headerRowsChanged',
            });
        }
    }

    public getHeaderCtrlForColumn(column: AgColumn | AgColumnGroup): AbstractHeaderCellCtrl | undefined {
        const findCtrl = (ctrl: HeaderRowCtrl | undefined) =>
            ctrl?.getHeaderCellCtrls().find((ctrl) => ctrl.column === column);

        if (isColumn(column)) {
            return findCtrl(this.columnsRowCtrl);
        }

        if (this.groupsRowCtrls.length === 0) {
            return;
        }

        for (let i = 0; i < this.groupsRowCtrls.length; i++) {
            const ctrl = findCtrl(this.groupsRowCtrls[i]);

            if (ctrl) {
                return ctrl;
            }
        }
    }

    public getHtmlElementForColumnHeader(column: AgColumn | AgColumnGroup): HTMLElement | null {
        return this.getHeaderCtrlForColumn(column)?.eGui ?? null;
    }

    public getRowType(rowIndex: number): HeaderRowType | undefined {
        return this.getAllCtrls()[rowIndex]?.type;
    }

    public focusHeader(rowIndex: number, column: AgColumn | AgColumnGroup, event?: KeyboardEvent): boolean {
        const allCtrls = this.getAllCtrls();
        const ctrl = allCtrls[rowIndex];
        if (!ctrl) {
            return false;
        }

        return ctrl.focusHeader(column, event);
    }

    public getGroupRowCount(): number {
        return this.groupsRowCtrls.length;
    }

    public getGroupRowCtrlAtIndex(index: number): HeaderRowCtrl {
        return this.groupsRowCtrls[index];
    }

    public getRowCount(): number {
        return this.groupsRowCtrls.length + (this.columnsRowCtrl ? 1 : 0) + (this.filtersRowCtrl ? 1 : 0);
    }

    public setHorizontalScroll(offset: number): void {
        this.comp.setViewportScrollLeft(offset);
    }

    public onScrollCallback(fn: () => void): void {
        this.addManagedElementListeners(this.eViewport, { scroll: fn });
    }

    public override destroy(): void {
        this.filtersRowCtrl = this.destroyBean(this.filtersRowCtrl);

        this.columnsRowCtrl = this.destroyBean(this.columnsRowCtrl);

        this.groupsRowCtrls = this.destroyBeans(this.groupsRowCtrls);

        super.destroy();
    }

    private setupDragAndDrop(colMoves: ColumnMoveService | undefined, dropContainer: HTMLElement): void {
        const bodyDropTarget = colMoves?.createBodyDropTarget(this.pinned, dropContainer);
        if (bodyDropTarget) {
            this.createManagedBean(bodyDropTarget);
        }
    }

    private restoreFocusOnHeader(focusSvc: FocusService, position: HeaderPosition | null): void {
        if (!position) {
            return;
        }

        const { column } = position;

        if ((column as AgColumn | AgColumnGroup).getPinned() != this.pinned) {
            return;
        }

        focusSvc.focusHeaderPosition({ headerPosition: position, scroll: false });
    }

    private setupCenterWidth(): void {
        if (this.pinned != null) {
            return;
        }

        this.createManagedBean(new CenterWidthFeature((width) => this.comp.setCenterWidth(`${width}px`), true));
    }
}

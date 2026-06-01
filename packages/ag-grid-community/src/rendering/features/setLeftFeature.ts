import { _exists, _setAriaColSpan } from 'ag-stack';

import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import { isColumnGroup } from '../../entities/agColumnGroup';
import { _isDomLayout } from '../../gridOptionsUtils';
import { applyHorizontalPosition, getResolvedHorizontalOffset } from './horizontalPositionUtils';

export class SetLeftFeature extends BeanStub {
    private readonly ariaEl: HTMLElement;

    private actualLeft: number;

    constructor(
        private readonly columnOrGroup: AgColumn | AgColumnGroup,
        private readonly eCell: HTMLElement,
        beans: BeanCollection
    ) {
        super();
        this.columnOrGroup = columnOrGroup;
        this.ariaEl = eCell.querySelector('[role=columnheader]') || eCell;
        this.beans = beans;
    }

    public getColumnOrGroup(): AgColumn | AgColumnGroup {
        // column.getLeft() is "distance from start edge" — in both LTR and RTL,
        // this.columnOrGroup is the start-edge column/group of any col-spanning range.
        return this.columnOrGroup;
    }

    public postConstruct(): void {
        const onLeftChanged = this.onLeftChanged.bind(this);
        this.addManagedListeners(this.columnOrGroup, { leftChanged: onLeftChanged });
        if (isColumnGroup(this.columnOrGroup)) {
            this.addManagedListeners(this.columnOrGroup, { displayedChildrenChanged: onLeftChanged });
        }
        this.setLeftFirstTime();

        // when in print layout, the left position is also dependent on the width of the pinned sections.
        // so additionally update left if any column width changes.
        this.addManagedEventListeners({ displayedColumnsWidthChanged: onLeftChanged });

        // setting left has a dependency on print layout
        this.addManagedPropertyListener('domLayout', onLeftChanged);
    }

    private setLeftFirstTime(): void {
        const { gos, colAnimation } = this.beans;
        const suppressMoveAnimation = gos.get('suppressColumnMoveAnimation');
        const oldLeftExists = _exists(this.columnOrGroup.getOldLeft());
        const animateColumnMove = colAnimation?.isActive() && oldLeftExists && !suppressMoveAnimation;
        if (animateColumnMove) {
            this.animateInLeft();
        } else {
            this.onLeftChanged();
        }
    }

    private animateInLeft(): void {
        const colOrGroup = this.getColumnOrGroup();
        const { gos, visibleCols } = this.beans;
        const isRtl = gos.get('enableRtl');
        const isPrintLayout = _isDomLayout(gos, 'print');
        const width = colOrGroup.getActualWidth();

        const oldActualLeft = getResolvedHorizontalOffset({
            left: colOrGroup.getOldLeft()!,
            pinned: colOrGroup.getPinned(),
            width,
            isPrintLayout,
            isRtl,
            visibleCols,
        })!;

        const actualLeft = getResolvedHorizontalOffset({
            left: colOrGroup.getLeft()!,
            pinned: colOrGroup.getPinned(),
            width,
            isPrintLayout,
            isRtl,
            visibleCols,
        })!;

        this.setLeft(oldActualLeft);

        // we must keep track of the left we want to set to, as this would otherwise lead to a race
        // condition, if the user changed the left value many times in one VM turn, then we want to make
        // make sure the actualLeft we set in the timeout below (in the next VM turn) is the correct left
        // position. eg if user changes column position twice, then setLeft() below executes twice in next
        // VM turn, but only one (the correct one) should get applied.
        this.actualLeft = actualLeft;

        this.beans.colAnimation!.executeNextVMTurn(() => {
            // test this left value is the latest one to be applied, and if not, do nothing
            if (this.actualLeft === actualLeft) {
                this.setLeft(actualLeft);
            }
        });
    }

    private onLeftChanged(): void {
        const colOrGroup = this.getColumnOrGroup();
        const { gos, visibleCols } = this.beans;
        const left = colOrGroup.getLeft();
        this.actualLeft = getResolvedHorizontalOffset({
            left,
            pinned: colOrGroup.getPinned(),
            width: colOrGroup.getActualWidth(),
            isPrintLayout: _isDomLayout(gos, 'print'),
            isRtl: gos.get('enableRtl'),
            visibleCols,
        })!;
        this.setLeft(this.actualLeft);
    }

    private setLeft(value: number): void {
        // if the value is null, then that means the column is no longer
        // displayed. there is logic in the rendering to fade these columns
        // out, so we don't try and change their left positions.
        if (_exists(value)) {
            const colOrGroup = this.getColumnOrGroup();
            this.setHorizontalPosition(colOrGroup, value);
        }

        if (isColumnGroup(this.columnOrGroup)) {
            const children = this.columnOrGroup.getLeafColumns();

            if (!children.length) {
                return;
            }

            if (children.length > 1) {
                _setAriaColSpan(this.ariaEl, children.length);
            }
        }
    }

    private setHorizontalPosition(colOrGroup: AgColumn | AgColumnGroup, left: number): void {
        const { gos, visibleCols } = this.beans;
        applyHorizontalPosition(this.eCell, {
            offset: left,
            pinned: colOrGroup.getPinned(),
            width: colOrGroup.getActualWidth(),
            isPrintLayout: _isDomLayout(gos, 'print'),
            isRtl: gos.get('enableRtl'),
            visibleCols,
        });
    }
}

import { _areEqual } from 'ag-stack';

import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { IHeaderCellComp } from '../../headerRendering/cells/column/headerCellCtrl';
import type { IHeaderFilterCellComp } from '../../headerRendering/cells/floatingFilter/iHeaderFilterCellComp';
import type { ICellComp } from '../../rendering/cell/cellCtrl';
import { isRowNumberCol } from '../columnUtils';
import { HoverFeature } from './hoverFeature';

const CSS_COLUMN_HOVER = 'ag-column-hover';

export class ColumnHoverService extends BeanStub implements NamedBean {
    beanName = 'colHover' as const;

    private selectedColumns: AgColumn[] | null = null;
    /** The hovered columns while `columnHoverHighlight` is on: those whose cells show the hover class. */
    private shownColumns: AgColumn[] | null = null;

    public postConstruct() {
        this.addManagedPropertyListener('columnHoverHighlight', ({ currentValue }) => {
            if (!currentValue) {
                this.clearMouseOver();
            }
        });
    }

    public setMouseOver(columns: AgColumn[]): void {
        // don't highlight the row number column when mousing over a row number
        // cell, for consistency with how we don't highlight a header row when
        // hovering a header cell
        this.updateState(columns.filter((column) => !isRowNumberCol(column)));
    }

    public clearMouseOver(): void {
        this.updateState(null);
    }

    public isHovered(column: AgColumn): boolean {
        if (!this.gos.get('columnHoverHighlight')) {
            return false;
        }
        const selectedColumns = this.selectedColumns;
        return !!selectedColumns && selectedColumns.indexOf(column) >= 0;
    }

    public addHeaderColumnHoverListener(compBean: BeanStub, comp: IHeaderCellComp, column: AgColumn): void {
        const listener = () => {
            const isHovered = this.isHovered(column);
            comp.toggleCss('ag-column-hover', isHovered);
        };

        compBean.addManagedEventListeners({ columnHoverChanged: listener });
        listener();
    }

    public onCellColumnHover(column: AgColumn, cellComp?: ICellComp): void {
        if (!cellComp) {
            return;
        }

        const isHovered = this.isHovered(column);
        cellComp.toggleCss(CSS_COLUMN_HOVER, isHovered);
    }

    public addHeaderFilterColumnHoverListener(
        compBean: BeanStub,
        comp: IHeaderFilterCellComp,
        column: AgColumn,
        eGui: HTMLElement
    ): void {
        this.createHoverFeature(compBean, [column], eGui);

        const listener = () => {
            const hovered = this.isHovered(column);
            comp.toggleCss('ag-column-hover', hovered);
        };

        compBean.addManagedEventListeners({ columnHoverChanged: listener });
        listener();
    }

    public createHoverFeature(compBean: BeanStub, columns: AgColumn[], eGui: HTMLElement): void {
        compBean.createManagedBean(new HoverFeature(columns, eGui));
    }

    private updateState(columns: AgColumn[] | null): void {
        const shown = this.gos.get('columnHoverHighlight') ? columns : null;
        const shownChanged = !_areEqual(shown, this.shownColumns);
        if (!shownChanged && _areEqual(columns, this.selectedColumns)) {
            return; // the pointer moved to another cell of the hovered columns
        }
        this.selectedColumns = columns;
        this.shownColumns = shown;
        this.eventSvc.dispatchEvent({ type: 'columnHoverChanged' });
        if (shownChanged) {
            const rowCtrls = this.beans.rowRenderer.getAllRowCtrls();
            for (let i = 0, len = rowCtrls.length; i < len; ++i) {
                const cellCtrls = rowCtrls[i].getAllCellCtrls();
                for (let j = 0, cellsLen = cellCtrls.length; j < cellsLen; ++j) {
                    cellCtrls[j].onColumnHover();
                }
            }
        }
    }
}

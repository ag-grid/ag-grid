import { IHeaderColumn } from "../../interfaces/iHeaderColumn";
import { Column } from "../../entities/column";
import { BeanStub } from "../../context/beanStub";
import { Beans } from "../beans";
import { PostConstruct } from "../../context/context";
import { ColumnGroup } from "../../entities/columnGroup";
import { setAriaColSpan } from "../../utils/aria";
import { last } from "../../utils/array";
import { exists } from "../../utils/generic";
import { Events } from "../../eventKeys";

export class SetLeftFeature extends BeanStub {

    private readonly columnOrGroup: IHeaderColumn;
    private eCell: HTMLElement;
    private ariaEl: HTMLElement;

    private actualLeft: number;

    // if we are spanning columns, this tells what columns,
    // otherwise this is empty
    private colsSpanning: Column[] | undefined;

    private beans: Beans;

    constructor(columnOrGroup: IHeaderColumn, eCell: HTMLElement, beans: Beans, colsSpanning?: Column[]) {
        super();
        this.columnOrGroup = columnOrGroup;
        this.eCell = eCell;
        this.ariaEl = this.eCell.querySelector('[role=columnheader]') || this.eCell;
        this.colsSpanning = colsSpanning;
        this.beans = beans;
    }

    public setColsSpanning(colsSpanning: Column[]): void {
        this.colsSpanning = colsSpanning;
        this.onLeftChanged();
    }

    public getColumnOrGroup(): IHeaderColumn {
        if (this.beans.gos.get('enableRtl') && this.colsSpanning) {
            return last(this.colsSpanning);
        }
        return this.columnOrGroup;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.columnOrGroup, Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.setLeftFirstTime();

        // when in print layout, the left position is also dependent on the width of the pinned sections.
        // so additionally update left if any column width changes.
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onLeftChanged.bind(this));

        // setting left has a dependency on print layout
        this.addManagedPropertyListener('domLayout', this.onLeftChanged.bind(this));
    }

    private setLeftFirstTime(): void {
            this.onLeftChanged();
    }
    private onLeftChanged(): void {
        const colOrGroup = this.getColumnOrGroup();
        const left = colOrGroup.getLeft();
        this.actualLeft = left!;
        this.setLeft(this.actualLeft);
    }

    private setLeft(value: number): void {
        // if the value is null, then that means the column is no longer
        // displayed. there is logic in the rendering to fade these columns
        // out, so we don't try and change their left positions.
        if (exists(value)) {
            this.eCell.style.left = `${value}px`;
        }

        let indexColumn: Column;

        if (this.columnOrGroup instanceof Column) {
            indexColumn = this.columnOrGroup;
        } else {
            const columnGroup = this.columnOrGroup as ColumnGroup;
            const children = columnGroup.getLeafColumns();

            if (!children.length) { return; }

            if (children.length > 1) {
                setAriaColSpan(this.ariaEl, children.length);
            }

            indexColumn = children[0];
        }
    }
}

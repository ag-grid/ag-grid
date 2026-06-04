import { defineComponent } from "../framework/component";
import type { ResizeData, ScrollData } from "../framework/dom";
import { Row } from "./Row";
import type { ColDef, GridProps, VisibleRange } from "./types";

export class Grid extends defineComponent({
  tag: "div",
  cls: "grid-viewport",
  children: [
    {
      tag: "div",
      ref: "scrollableArea",
      cls: "grid-scrollable-area",
      children: [
        { tag: "div", ref: "pinnedTopRows", cls: "grid-pinned-top-rows" },
        { tag: "div", ref: "scrollingRows", cls: "grid-scrolling-rows" },
        { tag: "div", ref: "pinnedBottomRows", cls: "grid-pinned-bottom-rows" },
      ],
    },
  ],
}) {
  private props: GridProps;
  private viewportSize: ResizeData | null = null;
  private scrollPosition: ScrollData | null = null;

  private headerRow: Row | null = null;
  private pinnedTopDataRows: Row[] = [];
  private activeRows: Map<Record<string, unknown>, Row> = new Map(); // rowData object -> Row (keyed by data identity)
  private hiddenPool: Row[] = []; // display:none, NEVER updated
  private pinnedBottomDataRows: Row[] = [];

  private leftPinnedColDefs: ColDef[] = [];
  private rightPinnedColDefs: ColDef[] = [];
  private scrollingColDefs: ColDef[] = [];
  private columnPositions: Map<string, number> = new Map();
  private totalColumnsWidth: number = 0;
  private pinnedLeftWidth: number = 0;
  private pinnedRightWidth: number = 0;

  constructor(props: GridProps) {
    super();
    this.props = props;
    this.computeColumnLayout();
    this.setupObservers();
    this.createHeaderRow();
    this.createPinnedRows();
  }

  private computeColumnLayout(): void {
    this.leftPinnedColDefs = [];
    this.rightPinnedColDefs = [];
    this.scrollingColDefs = [];

    for (const colDef of this.props.colDefs) {
      if (colDef.pin === "left") {
        this.leftPinnedColDefs.push(colDef);
      } else if (colDef.pin === "right") {
        this.rightPinnedColDefs.push(colDef);
      } else {
        this.scrollingColDefs.push(colDef);
      }
    }

    this.pinnedLeftWidth = this.leftPinnedColDefs.reduce(
      (sum, col) => sum + col.width,
      0,
    );
    this.pinnedRightWidth = this.rightPinnedColDefs.reduce(
      (sum, col) => sum + col.width,
      0,
    );

    let scrollingLeft = this.pinnedLeftWidth;
    for (const colDef of this.scrollingColDefs) {
      this.columnPositions.set(colDef.name, scrollingLeft);
      scrollingLeft += colDef.width;
    }

    this.totalColumnsWidth =
      this.pinnedLeftWidth +
      this.scrollingColDefs.reduce((sum, col) => sum + col.width, 0) +
      this.pinnedRightWidth;
  }

  private setupObservers(): void {
    this.gui.observeResize((size) => {
      this.viewportSize = size;
      this.updateLayout();
    });

    this.gui.observeScroll((pos) => {
      this.scrollPosition = pos;
      this.updateLayout();
    });
  }

  private createHeaderRow(): void {
    this.headerRow = new Row();
    this.pinnedTopRows.add(this.headerRow);
  }

  private createPinnedRows(): void {
    const { pinnedTopRowData = [], pinnedBottomRowData = [] } = this.props;

    for (let i = 0; i < pinnedTopRowData.length; i++) {
      const row = new Row();
      this.pinnedTopDataRows.push(row);
      this.pinnedTopRows.add(row);
    }

    for (let i = 0; i < pinnedBottomRowData.length; i++) {
      const row = new Row();
      this.pinnedBottomDataRows.push(row);
      this.pinnedBottomRows.add(row);
    }
  }

  private updateLayout(): void {
    this.flushSync(() => {
      if (!this.viewportSize || !this.scrollPosition) return;
      const { width: vpWidth, height: vpHeight } = this.viewportSize;
      const { scrollTop, scrollLeft } = this.scrollPosition;
      const {
        rowData,
        colDefs,
        rowHeight,
        headerRowHeight,
        pinnedTopRowData = [],
        pinnedBottomRowData = [],
      } = this.props;

      const pinnedTopHeight =
        headerRowHeight + pinnedTopRowData.length * rowHeight;
      const pinnedBottomHeight = pinnedBottomRowData.length * rowHeight;
      const totalHeight =
        pinnedTopHeight + rowData.length * rowHeight + pinnedBottomHeight;

      this.scrollableArea.styles({
        width: this.totalColumnsWidth,
        height: totalHeight,
      });

      this.pinnedTopRows.styles({ height: pinnedTopHeight });
      this.pinnedBottomRows.styles({ height: pinnedBottomHeight });
      this.scrollingRows.styles({
        top: pinnedTopHeight,
        height: rowData.length * rowHeight,
      });

      const visibleColRange = this.calculateVisibleColRange(
        scrollLeft,
        vpWidth - this.pinnedRightWidth,
      );

      if (this.headerRow) {
        this.headerRow.setPosition(0);
        this.headerRow.setDimensions(this.totalColumnsWidth, headerRowHeight);
        this.headerRow.setPinnedLeftWidth(this.pinnedLeftWidth);
        this.headerRow.setPinnedRightWidth(this.pinnedRightWidth);

        const headerData: Record<string, unknown> = {};
        for (const colDef of colDefs) {
          headerData[colDef.name] = colDef.label;
        }

        this.headerRow.updateCells(
          headerData,
          -1,
          colDefs,
          visibleColRange,
          this.scrollingColDefs,
          this.leftPinnedColDefs,
          this.rightPinnedColDefs,
          this.columnPositions,
        );
      }

      let pinnedTopOffset = headerRowHeight;
      for (let i = 0; i < this.pinnedTopDataRows.length; i++) {
        const row = this.pinnedTopDataRows[i];
        row.setPosition(pinnedTopOffset);
        row.setDimensions(this.totalColumnsWidth, rowHeight);
        row.setPinnedLeftWidth(this.pinnedLeftWidth);
        row.setPinnedRightWidth(this.pinnedRightWidth);
        row.updateCells(
          pinnedTopRowData[i],
          i,
          colDefs,
          visibleColRange,
          this.scrollingColDefs,
          this.leftPinnedColDefs,
          this.rightPinnedColDefs,
          this.columnPositions,
        );
        pinnedTopOffset += rowHeight;
      }

      let pinnedBottomOffset = 0;
      for (let i = 0; i < this.pinnedBottomDataRows.length; i++) {
        const row = this.pinnedBottomDataRows[i];
        row.setPosition(pinnedBottomOffset);
        row.setDimensions(this.totalColumnsWidth, rowHeight);
        row.setPinnedLeftWidth(this.pinnedLeftWidth);
        row.setPinnedRightWidth(this.pinnedRightWidth);
        row.updateCells(
          pinnedBottomRowData[i],
          i,
          colDefs,
          visibleColRange,
          this.scrollingColDefs,
          this.leftPinnedColDefs,
          this.rightPinnedColDefs,
          this.columnPositions,
        );
        pinnedBottomOffset += rowHeight;
      }

      const scrollingViewportHeight =
        vpHeight - pinnedTopHeight - pinnedBottomHeight;
      const visibleRowRange = this.calculateVisibleRowRange(
        scrollTop,
        scrollingViewportHeight,
        rowData.length,
        rowHeight,
      );

      this.syncScrollingRows(visibleRowRange, visibleColRange);
    });
  }

  private calculateVisibleRowRange(
    scrollTop: number,
    viewportHeight: number,
    rowCount: number,
    rowHeight: number,
  ): VisibleRange {
    if (rowCount === 0) return { start: 0, end: 0 };

    const { bufferRows = 5 } = this.props;

    const firstRow = Math.max(
      0,
      Math.floor(scrollTop / rowHeight) - bufferRows,
    );
    const lastRow = Math.min(
      rowCount - 1,
      Math.ceil((scrollTop + viewportHeight) / rowHeight) + bufferRows,
    );

    return { start: firstRow, end: lastRow + 1 };
  }

  private calculateVisibleColRange(
    scrollLeft: number,
    viewportWidth: number,
  ): VisibleRange {
    if (this.scrollingColDefs.length === 0) return { start: 0, end: 0 };

    let left = this.pinnedLeftWidth;
    let firstCol = 0;
    let lastCol = this.scrollingColDefs.length - 1;

    for (let i = 0; i < this.scrollingColDefs.length; i++) {
      const colDef = this.scrollingColDefs[i];
      if (left + colDef.width > scrollLeft) {
        firstCol = Math.max(0, i - 1);
        break;
      }
      left += colDef.width;
    }

    left = this.pinnedLeftWidth;
    for (let i = 0; i < this.scrollingColDefs.length; i++) {
      const colDef = this.scrollingColDefs[i];
      if (left > scrollLeft + viewportWidth) {
        lastCol = Math.min(this.scrollingColDefs.length - 1, i + 1);
        break;
      }
      left += colDef.width;
    }

    return { start: firstCol, end: lastCol + 1 };
  }

  private syncScrollingRows(
    rowRange: VisibleRange,
    colRange: VisibleRange,
  ): void {
    const { rowData, colDefs, rowHeight, maxPoolSize = 20 } = this.props;
    const neededData = new Set<Record<string, unknown>>();

    // 1. Build set of needed data objects
    for (let i = rowRange.start; i < rowRange.end; i++) {
      neededData.add(rowData[i]);
    }

    // 2. Return rows no longer needed to pool
    for (const [data, row] of this.activeRows) {
      if (!neededData.has(data)) {
        this.activeRows.delete(data);
        if (this.hiddenPool.length < maxPoolSize) {
          row.setVisible(false);
          this.hiddenPool.push(row);
        } else {
          row.remove();
        }
      }
    }

    // 3. Acquire rows for data we need
    for (let i = rowRange.start; i < rowRange.end; i++) {
      const data = rowData[i];
      if (!this.activeRows.has(data)) {
        const row = this.acquireRow();
        this.activeRows.set(data, row);
      }
    }

    // 4. Update all active rows - find current index for each data object
    for (const [data, row] of this.activeRows) {
      const index = rowData.indexOf(data); // Find where this data is NOW
      row.setVisible(true);
      row.setPosition(index * rowHeight);
      row.setDimensions(this.totalColumnsWidth, rowHeight);
      row.setPinnedLeftWidth(this.pinnedLeftWidth);
      row.setPinnedRightWidth(this.pinnedRightWidth);
      row.updateCells(
        data,
        index,
        colDefs,
        colRange,
        this.scrollingColDefs,
        this.leftPinnedColDefs,
        this.rightPinnedColDefs,
        this.columnPositions,
      );
    }
  }

  private acquireRow(): Row {
    if (this.hiddenPool.length > 0) {
      return this.hiddenPool.pop()!;
    }
    const row = new Row();
    this.scrollingRows.add(row);
    return row;
  }

  swapRowsByIndex(i: number, j: number): void {
    const temp = this.props.rowData[i];
    this.props.rowData[i] = this.props.rowData[j];
    this.props.rowData[j] = temp;
    this.animateAndUpdate();
  }

  swapColumnsByIndex(i: number, j: number): void {
    const temp = this.props.colDefs[i];
    this.props.colDefs[i] = this.props.colDefs[j];
    this.props.colDefs[j] = temp;
    this.computeColumnLayout();
    this.animateAndUpdate();
  }

  private animateAndUpdate(): void {
    this.gui.cls("grid-animating");
    this.updateLayout();
    setTimeout(() => {
      this.gui.cls("grid-animating", false);
    }, 400);
  }
}

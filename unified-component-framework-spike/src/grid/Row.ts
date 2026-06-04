import { defineComponent } from "../framework/component";
import { Cell } from "./Cell";
import type { ColDef, VisibleRange } from "./types";

export class Row extends defineComponent({
  tag: "div",
  cls: "grid-row",
  children: [
    { tag: "div", ref: "pinnedLeftCells", cls: "grid-pinned-left-cells" },
    { tag: "div", ref: "scrollingCells", cls: "grid-scrolling-cells" },
    { tag: "div", ref: "pinnedRightCells", cls: "grid-pinned-right-cells" },
  ],
}) {
  private leftCellMap: Map<ColDef, Cell> = new Map();
  private scrollingCellMap: Map<ColDef, Cell> = new Map();
  private rightCellMap: Map<ColDef, Cell> = new Map();
  private currentVisibleRange: VisibleRange | null = null;

  setPosition(top: number): void {
    this.gui.styles({ transform: `translateY(${top}px)` });
  }

  setVisible(visible: boolean): void {
    this.gui.styles({ display: visible ? "" : "none" });
  }

  setDimensions(width: number, height: number): void {
    this.gui.styles({ width, height });
  }

  setPinnedLeftWidth(width: number): void {
    this.pinnedLeftCells.styles({ width });
  }

  setPinnedRightWidth(width: number): void {
    this.pinnedRightCells.styles({ width });
  }

  updateCells(
    data: Record<string, unknown>,
    rowIndex: number,
    colDefs: ColDef[],
    visibleColRange: VisibleRange,
    scrollingColDefs: ColDef[],
    leftPinnedColDefs: ColDef[],
    rightPinnedColDefs: ColDef[],
    columnPositions: Map<string, number>,
  ): void {
    this.updatePinnedLeftCells(
      data,
      rowIndex,
      leftPinnedColDefs,
      columnPositions,
    );
    this.updateScrollingCells(
      data,
      rowIndex,
      scrollingColDefs,
      visibleColRange,
      columnPositions,
    );
    this.updatePinnedRightCells(
      data,
      rowIndex,
      rightPinnedColDefs,
      columnPositions,
    );
  }

  private getCellValue(
    colDef: ColDef,
    data: Record<string, unknown>,
    rowIndex: number,
  ): unknown {
    if (colDef.valueGetter && rowIndex >= 0) {
      return colDef.valueGetter({ data, rowIndex });
    }
    return data[colDef.name];
  }

  private updatePinnedLeftCells(
    data: Record<string, unknown>,
    rowIndex: number,
    colDefs: ColDef[],
    columnPositions: Map<string, number>,
  ): void {
    const neededColDefs = new Set(colDefs);

    // Remove cells for columns no longer needed
    for (const [colDef, cell] of this.leftCellMap) {
      if (!neededColDefs.has(colDef)) {
        this.leftCellMap.delete(colDef);
        cell.remove();
      }
    }

    // Acquire cells for columns we need
    for (const colDef of colDefs) {
      if (!this.leftCellMap.has(colDef)) {
        const cell = new Cell();
        this.leftCellMap.set(colDef, cell);
        this.pinnedLeftCells.add(cell);
      }
    }

    // Update all cells - calculate position from current column order
    let left = 0;
    for (const colDef of colDefs) {
      const cell = this.leftCellMap.get(colDef)!;
      cell.setValue(this.getCellValue(colDef, data, rowIndex));
      cell.setPosition(left, colDef.width);
      left += colDef.width;
    }
  }

  private updatePinnedRightCells(
    data: Record<string, unknown>,
    rowIndex: number,
    colDefs: ColDef[],
    columnPositions: Map<string, number>,
  ): void {
    const neededColDefs = new Set(colDefs);

    // Remove cells for columns no longer needed
    for (const [colDef, cell] of this.rightCellMap) {
      if (!neededColDefs.has(colDef)) {
        this.rightCellMap.delete(colDef);
        cell.remove();
      }
    }

    // Acquire cells for columns we need
    for (const colDef of colDefs) {
      if (!this.rightCellMap.has(colDef)) {
        const cell = new Cell();
        this.rightCellMap.set(colDef, cell);
        this.pinnedRightCells.add(cell);
      }
    }

    // Update all cells - calculate position from current column order
    let right = 0;
    for (let i = colDefs.length - 1; i >= 0; i--) {
      const colDef = colDefs[i];
      const cell = this.rightCellMap.get(colDef)!;
      cell.setValue(this.getCellValue(colDef, data, rowIndex));
      cell.setPositionRight(right, colDef.width);
      right += colDef.width;
    }
  }

  private updateScrollingCells(
    data: Record<string, unknown>,
    rowIndex: number,
    colDefs: ColDef[],
    visibleRange: VisibleRange,
    columnPositions: Map<string, number>,
  ): void {
    // Build set of visible column defs
    const neededColDefs = new Set<ColDef>();
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      neededColDefs.add(colDefs[i]);
    }

    // Remove cells for columns no longer visible
    for (const [colDef, cell] of this.scrollingCellMap) {
      if (!neededColDefs.has(colDef)) {
        this.scrollingCellMap.delete(colDef);
        cell.remove();
      }
    }

    // Acquire cells for columns we need
    for (const colDef of neededColDefs) {
      if (!this.scrollingCellMap.has(colDef)) {
        const cell = new Cell();
        this.scrollingCellMap.set(colDef, cell);
        this.scrollingCells.add(cell);
      }
    }

    // Update all cells - calculate position from current column position
    for (const [colDef, cell] of this.scrollingCellMap) {
      cell.setValue(this.getCellValue(colDef, data, rowIndex));
      const left = columnPositions.get(colDef.name) ?? 0;
      cell.setPosition(left, colDef.width);
    }

    this.currentVisibleRange = visibleRange;
  }
}

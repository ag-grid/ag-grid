import { defineComponent } from "../framework/component";
import { Grid } from "./Grid";
import {
  rowData,
  colDefs,
  pinnedTopRowData,
  pinnedBottomRowData,
} from "./data";

export class GridDemo extends defineComponent({
  tag: "div",
  cls: "grid-demo",
  children: [
    {
      tag: "header",
      ref: "header",
      cls: "grid-demo-header",
      children: [
        { tag: "h1", ref: "title", text: "" },
        { tag: "button", ref: "swapRowsBtn", text: "Swap rows 3 & 4" },
        { tag: "button", ref: "swapColsBtn", text: "Swap columns 3 & 4" },
      ],
    },
    {
      tag: "div",
      ref: "container",
      cls: "grid-container",
    },
  ],
}) {
  private grid: Grid;

  constructor(title: string) {
    super();
    this.title.text = title;

    this.grid = new Grid({
      rowData,
      colDefs,
      rowHeight: 32,
      headerRowHeight: 40,
      pinnedTopRowData,
      pinnedBottomRowData,
      bufferRows: 20,
    });

    this.container.add(this.grid);

    this.swapRowsBtn.on("click", () => {
      this.grid.swapRowsByIndex(3, 4);
    });

    this.swapColsBtn.on("click", () => {
      this.grid.swapColumnsByIndex(3, 4);
    });
  }
}

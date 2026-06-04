import { defineComponent } from "../framework/component";
import type { DomElementWithChildren } from "../framework/dom";

export class Tray extends defineComponent({
  tag: "div",
  cls: "reorder-tray",
  children: [
    { tag: "div", ref: "trayHeader", text: "", cls: "reorder-tray-header" },
    { tag: "div", ref: "items", cls: "reorder-tray-items" },
  ],
}) {
  constructor(title: string) {
    super();
    this.trayHeader.text = title;
  }

  /** The items ref, for parent to call child functions on */
  getItemsRef(): DomElementWithChildren {
    return this.items;
  }

  setTitle(title: string): void {
    this.trayHeader.text = title;
  }
}

import { defineComponent } from "../framework/component";

export class Cell extends defineComponent({
  tag: "div",
  text: "",
  cls: "grid-cell",
}) {
  setValue(value: unknown): void {
    this.gui.text = value == null ? "" : String(value);
  }

  setPosition(left: number, width: number): void {
    this.gui.styles({ transform: `translateX(${left}px)`, width });
  }

  setPositionRight(right: number, width: number): void {
    // Anchor to right edge, then offset leftward using transform
    this.gui.styles({ left: "auto", right: 0, transform: `translateX(${-right}px)`, width });
  }
}

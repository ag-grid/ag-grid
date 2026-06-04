import { defineComponent } from "../framework/component";

export class Card extends defineComponent({
  tag: "div",
  cls: "reorder-card",
  children: [
    { tag: "span", ref: "emoji", text: "", cls: "reorder-card-emoji" },
    { tag: "span", ref: "label", text: "", cls: "reorder-card-label" },
  ],
}) {
  private name: string;

  constructor(emoji: string, name: string, color: string) {
    super();
    this.name = name;
    this.emoji.text = emoji;
    this.label.text = name;
    this.gui.styles({ backgroundColor: color });
  }

  setSelected(selected: boolean): void {
    this.gui.cls("reorder-card-selected", selected);
  }

  setReference(reference: boolean): void {
    this.gui.cls("reorder-card-reference", reference);
  }

  getName(): string {
    return this.name;
  }

  onClick(handler: () => void): void {
    this.gui.on("click", handler);
  }
}

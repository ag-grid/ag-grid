import { defineComponent } from "../framework/component";
import { Card } from "./Card";
import { Tray } from "./Tray";

const CARD_PRESETS: [string, string, string][] = [
  ["\u{1F9A9}", "Flamingo", "#ffcdd2"],
  ["\u{1F33B}", "Sunflower", "#fff9c4"],
  ["\u26A1", "Lightning", "#ffe0b2"],
  ["\u{1F30A}", "Ocean", "#bbdefb"],
  ["\u{1F335}", "Cactus", "#c8e6c9"],
  ["\u26F0\uFE0F", "Mountain", "#d7ccc8"],
  ["\u{1F680}", "Rocket", "#e1bee7"],
  ["\u{1F308}", "Rainbow", "#f8bbd0"],
  ["\u{1F525}", "Fire", "#ffccbc"],
  ["\u2B50", "Star", "#f0f4c3"],
];

export class ReorderDemo extends defineComponent({
  tag: "div",
  cls: "reorder-demo",
  children: [
    {
      tag: "header",
      ref: "header",
      cls: "reorder-demo-header",
      children: [{ tag: "h1", ref: "title", text: "" }],
    },
    {
      tag: "div",
      ref: "toolbar",
      cls: "reorder-toolbar",
      children: [
        { tag: "button", ref: "appendBtn", text: "Append (to end)" },
        { tag: "button", ref: "insertBeforeBtn", text: "Insert Before Ref" },
        { tag: "button", ref: "insertAfterBtn", text: "Insert After Ref" },
        { tag: "button", ref: "removeBtn", text: "Remove" },
        { tag: "button", ref: "newCardBtn", text: "New Card" },
        { tag: "button", ref: "moveToOtherBtn", text: "Move to Other Tray" },
      ],
    },
    {
      tag: "div",
      ref: "traysContainer",
      cls: "reorder-trays-container",
    },
    {
      tag: "div",
      ref: "logContainer",
      cls: "reorder-log-container",
      children: [
        { tag: "div", ref: "logHeader", text: "Operation Log", cls: "reorder-log-header" },
        { tag: "div", ref: "log", text: "", cls: "reorder-log" },
      ],
    },
  ],
}) {
  private trayA: Tray;
  private trayB: Tray;
  private selectedCard: Card | null = null;
  private referenceCard: Card | null = null;
  private logLines: string[] = [];
  private nextPresetIndex = 0;

  private getNextPreset(): [string, string, string] {
    const preset = CARD_PRESETS[this.nextPresetIndex % CARD_PRESETS.length];
    this.nextPresetIndex++;
    return preset;
  }

  constructor(title: string) {
    super();
    this.title.text = title;

    // Create trays
    this.trayA = new Tray("Tray A");
    this.trayB = new Tray("Tray B");
    this.traysContainer.add(this.trayA);
    this.traysContainer.add(this.trayB);

    // Add initial cards: 4 in Tray A, 3 in Tray B
    for (let i = 0; i < 4; i++) {
      const [emoji, name, color] = this.getNextPreset();
      this.addCardToTray(this.trayA, emoji, name, color);
    }
    for (let i = 0; i < 3; i++) {
      const [emoji, name, color] = this.getNextPreset();
      this.addCardToTray(this.trayB, emoji, name, color);
    }

    // Button handlers
    this.appendBtn.on("click", () => this.handleAppend());
    this.insertBeforeBtn.on("click", () => this.handleInsertBefore());
    this.insertAfterBtn.on("click", () => this.handleInsertAfter());
    this.removeBtn.on("click", () => this.handleRemove());
    this.newCardBtn.on("click", () => this.handleNewCard());
    this.moveToOtherBtn.on("click", () => this.handleMoveToOther());
  }

  private addCardToTray(
    tray: Tray,
    emoji: string,
    name: string,
    color: string,
  ): Card {
    const card = new Card(emoji, name, color);
    tray.getItemsRef().add(card);
    card.onClick(() => this.handleCardClick(card));
    return card;
  }

  private handleCardClick(card: Card): void {
    if (this.selectedCard === card) {
      // Deselect
      card.setSelected(false);
      this.selectedCard = null;
      return;
    }

    if (this.selectedCard === null) {
      // Select
      card.setSelected(true);
      this.selectedCard = card;
      return;
    }

    // Already have a selection - set as reference
    if (this.referenceCard) {
      this.referenceCard.setReference(false);
    }
    if (this.referenceCard === card) {
      // Clicking current reference deselects it
      this.referenceCard = null;
      return;
    }
    card.setReference(true);
    this.referenceCard = card;
  }

  private clearSelection(): void {
    if (this.selectedCard) {
      this.selectedCard.setSelected(false);
      this.selectedCard = null;
    }
    if (this.referenceCard) {
      this.referenceCard.setReference(false);
      this.referenceCard = null;
    }
  }

  private getTrayForCard(card: Card): Tray | null {
    if (card.parent === this.trayA.getItemsRef()) return this.trayA;
    if (card.parent === this.trayB.getItemsRef()) return this.trayB;
    return null;
  }

  private getOtherTray(tray: Tray): Tray {
    return tray === this.trayA ? this.trayB : this.trayA;
  }

  private appendLog(message: string): void {
    this.logLines.push(message);
    if (this.logLines.length > 20) {
      this.logLines.shift();
    }
    this.log.text = this.logLines.join("\n");
  }

  private handleAppend(): void {
    if (!this.selectedCard) return;
    const card = this.selectedCard;
    const tray = this.getTrayForCard(card);
    if (!tray) return;

    this.appendLog(
      `ref.add(${card.getName()}) [append in ${tray === this.trayA ? "trayA" : "trayB"}]`,
    );
    this.clearSelection();
    tray.getItemsRef().add(card);
  }

  private handleInsertBefore(): void {
    if (!this.selectedCard || !this.referenceCard) return;
    const card = this.selectedCard;
    const ref = this.referenceCard;
    const refTray = this.getTrayForCard(ref);
    if (!refTray) return;

    const trayName = refTray === this.trayA ? "trayA" : "trayB";
    this.appendLog(
      `ref.add(${card.getName()}, {before: ${ref.getName()}}) [${trayName}]`,
    );
    this.clearSelection();
    refTray.getItemsRef().add(card, { before: ref });
  }

  private handleInsertAfter(): void {
    if (!this.selectedCard || !this.referenceCard) return;
    const card = this.selectedCard;
    const ref = this.referenceCard;
    const refTray = this.getTrayForCard(ref);
    if (!refTray) return;

    const trayName = refTray === this.trayA ? "trayA" : "trayB";
    this.appendLog(
      `ref.add(${card.getName()}, {after: ${ref.getName()}}) [${trayName}]`,
    );
    this.clearSelection();
    refTray.getItemsRef().add(card, { after: ref });
  }

  private handleRemove(): void {
    if (!this.selectedCard) return;
    const card = this.selectedCard;

    this.appendLog(`${card.getName()}.remove()`);
    this.clearSelection();
    card.remove();
  }

  private handleNewCard(): void {
    const [emoji, name, color] = this.getNextPreset();
    const card = this.addCardToTray(this.trayA, emoji, name, color);

    this.appendLog(
      `trayA.items.add(new Card("${emoji}", "${name}"))`,
    );
  }

  private handleMoveToOther(): void {
    if (!this.selectedCard) return;
    const card = this.selectedCard;
    const tray = this.getTrayForCard(card);
    if (!tray) return;
    const otherTray = this.getOtherTray(tray);

    const fromName = tray === this.trayA ? "trayA" : "trayB";
    const toName = otherTray === this.trayA ? "trayA" : "trayB";
    this.appendLog(
      `${toName}.items.add(${card.getName()}) [from ${fromName}]`,
    );
    this.clearSelection();
    otherTray.getItemsRef().add(card);
  }
}

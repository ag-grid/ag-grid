import {BaseHtmlElementBuilder, HtmlElementDecorable} from "ag-grid/main";

export class ToolbarItemBuilder extends BaseHtmlElementBuilder {
    constructor() {
        super()
    }

    enrich(decorable: HtmlElementDecorable): void {
        decorable
            .withTag('div')
            .withClass('ag-column-tool-panel-item');
    }
}

export class ToolbarBuilder extends BaseHtmlElementBuilder {
    items: ToolbarItemBuilder [] = [];

    constructor() {
        super()
    }

    withButton(item: ToolbarItemBuilder): ToolbarBuilder {
        this.items.push(item);
        return this;
    }

    withButtons(items: ToolbarItemBuilder[]): ToolbarBuilder {
        items.forEach(item => this.withButton(item));
        return this;
    }

    enrich(decorable: HtmlElementDecorable): void {
        decorable
            .withTag('div')
            .withClass('ag-column-tool-panel')
            .withRef('toolPanel');

        this.items.forEach(item => decorable.withChild(BaseHtmlElementBuilder.fromString(`<button>`).withChild(item)));
    }
}

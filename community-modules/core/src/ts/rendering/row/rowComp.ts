import { Component } from "../../widgets/component";
import { RowContainerComp } from "../../gridBodyComp/rowContainer/rowContainerComp";
import { ICellRendererComp } from "../cellRenderers/iCellRenderer";
import { Beans } from "../beans";
import { RowNode } from "../../entities/rowNode";
import { loadTemplate } from "../../utils/dom";
import { escapeString } from "../../utils/string";
import { cssStyleObjectToMarkup } from "../../utils/general";
import { RowController } from "./rowController";

export class RowComp extends Component {

    private container: RowContainerComp;

    private fullWidthRowComponent: ICellRendererComp | null | undefined;

    private beans: Beans;
    private pinned: string | null;

    private rowNode: RowNode;

    private controller: RowController;

    constructor(controller: RowController, container: RowContainerComp, beans: Beans, rowNode: RowNode, pinned: string | null, extraCssClass: string | null) {
        super();

        this.container = container;
        this.beans = beans;
        this.rowNode = rowNode;
        this.pinned = pinned;
        this.controller = controller;

        const template = this.createTemplate(extraCssClass);
        this.setTemplate(template);
        container.appendRow(this.getGui());
    }

    public getContainer(): RowContainerComp {
        return this.container;
    }

    public setFullWidthRowComp(fullWidthRowComponent: ICellRendererComp): void {
        this.fullWidthRowComponent = fullWidthRowComponent;
    }

    public getFullWidthRowComp(): ICellRendererComp | null | undefined {
        return this.fullWidthRowComponent;
    }

    public destroyFullWidthComponent(): void {
        if (this.fullWidthRowComponent) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, this.pinned, this.fullWidthRowComponent);
            this.fullWidthRowComponent = null;
        }
    }

    private createTemplate(extraCssClass: string | null = null): string {
        const con = this.controller;

        const templateParts: string[] = [];
        const rowHeight = this.rowNode.rowHeight;
        const rowClasses = con.getInitialRowClasses(extraCssClass!).join(' ');
        const rowIdSanitised = escapeString(this.rowNode.id!);
        const userRowStyles = con.preProcessStylesFromGridOptions();
        const businessKey = con.getRowBusinessKey();
        const businessKeySanitised = escapeString(businessKey!);
        const rowTopStyle = con.getInitialRowTopStyle();
        const rowIdx = this.rowNode.getRowIndexString();
        const headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();

        templateParts.push(`<div`);
        templateParts.push(` role="row"`);
        templateParts.push(` row-index="${rowIdx}" aria-rowindex="${headerRowCount + this.rowNode.rowIndex! + 1}"`);
        templateParts.push(rowIdSanitised ? ` row-id="${rowIdSanitised}"` : ``);
        templateParts.push(businessKey ? ` row-business-key="${businessKeySanitised}"` : ``);
        templateParts.push(` comp-id="${this.getCompId()}"`);
        templateParts.push(` class="${rowClasses}"`);

        if (con.isFullWidth()) {
            templateParts.push(` tabindex="-1"`);
        }

        if (this.beans.gridOptionsWrapper.isRowSelection()) {
            templateParts.push(` aria-selected="${this.rowNode.isSelected() ? 'true' : 'false'}"`);
        }

        if (this.rowNode.group) {
            templateParts.push(` aria-expanded=${this.rowNode.expanded ? 'true' : 'false'}`);
        }

        templateParts.push(` style="height: ${rowHeight}px; ${rowTopStyle} ${userRowStyles}">`);

        // add in the template for the cells
        templateParts.push(`</div>`);

        return templateParts.join('');
    }



}

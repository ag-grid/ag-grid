import { Component } from "../../widgets/component";
import { RowContainerComp } from "../../gridBodyComp/rowContainer/rowContainerComp";
import { ICellRendererComp } from "../cellRenderers/iCellRenderer";
import { Beans } from "../beans";
import { RowNode } from "../../entities/rowNode";
import { addCssClass, loadTemplate } from "../../utils/dom";
import { escapeString } from "../../utils/string";
import { cssStyleObjectToMarkup } from "../../utils/general";
import { RowController } from "./rowController";
import { exists } from "../../utils/generic";

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

        this.afterRowAttached();
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

    private afterRowAttached(): void {

        this.addDomData();

        const eRow = this.getGui();

        this.controller.addRemoveSecondPassFunc(() => {
            this.container.removeRow(eRow);
        });

        this.controller.addRemoveFirstPassFunc(() => {
            if (exists(this.rowNode.rowTop)) {
                // the row top is updated anyway, however we set it here again
                // to something more reasonable for the animation - ie if the
                // row top is 10000px away, the row will flash out, so this
                // gives it a rounded value, so row animates out more slowly
                const rowTop = this.controller.roundRowTopToBounds(this.rowNode.rowTop);
                this.controller.setRowTop(rowTop);
            } else {
                addCssClass(eRow, 'ag-opacity-zero');
            }
        });

        // adding hover functionality adds listener to this row, so we
        // do it lazily in an animation frame
        if (this.controller.isUseAnimationFrameForCreate()) {
            this.beans.taskQueue.createTask(
                this.controller.addHoverFunctionality.bind(this.controller, eRow),
                this.rowNode.rowIndex!,
                'createTasksP2'
            );
        } else {
            this.controller.addHoverFunctionality(eRow);
        }

        this.controller.executeProcessRowPostCreateFunc();
    }

    private addDomData(): void {
        const gow = this.beans.gridOptionsWrapper;
        gow.setDomData(this.getGui(), RowController.DOM_DATA_KEY_RENDERED_ROW, this);
        this.addDestroyFunc(
            () => gow.setDomData(this.getGui(), RowController.DOM_DATA_KEY_RENDERED_ROW, null)
        );
    }

}

import { Component } from "../../widgets/component";
import { RowContainerComp } from "../../gridBodyComp/rowContainer/rowContainerComp";
import { ICellRendererComp } from "../cellRenderers/iCellRenderer";
import { Beans } from "../beans";
import { RowNode } from "../../entities/rowNode";

export class RowComp extends Component {

    private container: RowContainerComp;

    private fullWidthRowComponent: ICellRendererComp | null | undefined;

    private beans: Beans;
    private pinned: string | null;

    private rowNode: RowNode;

    constructor(eGui: HTMLElement, container: RowContainerComp, beans: Beans, rowNode: RowNode, pinned: string | null) {
        super();
        this.setGui(eGui);
        this.container = container;
        this.beans = beans;
        this.rowNode = rowNode;
        this.pinned = pinned;
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
}

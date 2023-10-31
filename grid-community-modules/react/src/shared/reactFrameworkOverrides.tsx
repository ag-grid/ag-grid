import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
import GroupCellRenderer from "../reactUi/cellRenderer/groupCellRenderer";
import DetailCellRenderer from "../reactUi/cellRenderer/detailCellRenderer";

export class ReactFrameworkOverrides extends VanillaFrameworkOverrides {

    constructor() {
        super('react');
        this.renderingEngine = 'react';
    }

    private frameworkComponents: any = {
        agGroupCellRenderer: GroupCellRenderer,
        agGroupRowRenderer: GroupCellRenderer,
        agDetailCellRenderer: DetailCellRenderer
    };

    public frameworkComponent(name: string): any {
        return this.frameworkComponents[name];
    }

    isFrameworkComponent(comp: any): boolean {
        if (!comp) { return false; }
        const prototype = comp.prototype;
        const isJsComp = prototype && 'getGui' in prototype;
        return !isJsComp;
    }
}
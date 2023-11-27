// @ag-grid-community/react v31.0.0
import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
import GroupCellRenderer from "../reactUi/cellRenderer/groupCellRenderer.mjs";
import DetailCellRenderer from "../reactUi/cellRenderer/detailCellRenderer.mjs";
export class ReactFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor() {
        super('react');
        this.frameworkComponents = {
            agGroupCellRenderer: GroupCellRenderer,
            agGroupRowRenderer: GroupCellRenderer,
            agDetailCellRenderer: DetailCellRenderer
        };
        this.renderingEngine = 'react';
    }
    frameworkComponent(name) {
        return this.frameworkComponents[name];
    }
    isFrameworkComponent(comp) {
        if (!comp) {
            return false;
        }
        const prototype = comp.prototype;
        const isJsComp = prototype && 'getGui' in prototype;
        return !isJsComp;
    }
}

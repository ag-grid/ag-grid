// @ag-grid-community/react v30.2.0
import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
import GroupCellRenderer from "../reactUi/cellRenderer/groupCellRenderer.mjs";
import DetailCellRenderer from "../reactUi/cellRenderer/detailCellRenderer.mjs";
export class ReactFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(reactUi) {
        super();
        this.frameworkComponents = {
            agGroupCellRenderer: GroupCellRenderer,
            agGroupRowRenderer: GroupCellRenderer,
            agDetailCellRenderer: DetailCellRenderer
        };
        this.reactUi = reactUi;
        this.renderingEngine = reactUi ? 'react' : 'vanilla';
    }
    frameworkComponent(name) {
        if (!this.reactUi) {
            return;
        }
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

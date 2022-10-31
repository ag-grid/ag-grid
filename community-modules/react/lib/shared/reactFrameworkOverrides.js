// @ag-grid-community/react v28.2.1
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const groupCellRenderer_1 = __importDefault(require("../reactUi/cellRenderer/groupCellRenderer"));
const detailCellRenderer_1 = __importDefault(require("../reactUi/cellRenderer/detailCellRenderer"));
class ReactFrameworkOverrides extends core_1.VanillaFrameworkOverrides {
    constructor(reactUi) {
        super();
        this.frameworkComponents = {
            agGroupCellRenderer: groupCellRenderer_1.default,
            agGroupRowRenderer: groupCellRenderer_1.default,
            agDetailCellRenderer: detailCellRenderer_1.default
        };
        this.reactUi = reactUi;
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
exports.ReactFrameworkOverrides = ReactFrameworkOverrides;

//# sourceMappingURL=reactFrameworkOverrides.js.map

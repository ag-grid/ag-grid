// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var protectionFactory = {
    getTemplate: function (protection) {
        var locked = protection.protected === false ? 0 : 1;
        var hidden = protection.hideFormula === true ? 1 : 0;
        return {
            name: 'protection',
            properties: {
                rawMap: {
                    hidden: hidden,
                    locked: locked
                }
            }
        };
    }
};
exports.default = protectionFactory;

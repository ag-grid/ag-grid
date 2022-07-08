"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protectionFactory = {
    getTemplate(protection) {
        const locked = protection.protected === false ? 0 : 1;
        const hidden = protection.hideFormula === true ? 1 : 0;
        return {
            name: 'protection',
            properties: {
                rawMap: {
                    hidden,
                    locked
                }
            }
        };
    }
};
exports.default = protectionFactory;

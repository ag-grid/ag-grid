import { ExcelOOXMLTemplate, ExcelProtection } from '@ag-grid-community/core';

const protectionFactory: ExcelOOXMLTemplate = {
    getTemplate(protection: ExcelProtection) {
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

export default protectionFactory;

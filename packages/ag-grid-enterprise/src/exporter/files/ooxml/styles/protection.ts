import { ExcelOOXMLTemplate, ExcelProtection } from 'ag-grid-community';

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

export interface Protection {
    locked: boolean;
    hidden: boolean;
}

export default protectionFactory;

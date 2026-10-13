import type { ExcelOOXMLTemplate, ExcelProtection } from 'ag-grid-community';

const protectionFactory: ExcelOOXMLTemplate = {
    getTemplate(protection: ExcelProtection) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- user code can return or pass any value at runtime, so only an explicit literal counts
        const locked = protection.protected === false ? 0 : 1;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- user code can return or pass any value at runtime, so only an explicit literal counts
        const hidden = protection.hideFormula === true ? 1 : 0;
        return {
            name: 'protection',
            properties: {
                rawMap: {
                    hidden,
                    locked,
                },
            },
        };
    },
};

export default protectionFactory;

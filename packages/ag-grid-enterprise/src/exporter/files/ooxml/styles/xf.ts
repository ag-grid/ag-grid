import { ExcelOOXMLTemplate, XmlElement, ExcelAlignment, ExcelProtection } from 'ag-grid-community';
import alignmentFactory from './alignment';
import protectionFactory from './protection';

const xfFactory: ExcelOOXMLTemplate = {
    getTemplate(xf: Xf) {
        const {alignment, borderId, fillId, fontId, numFmtId, protection, xfId} = xf;
        const children: XmlElement[] = [];
        if (alignment) {
            children.push(alignmentFactory.getTemplate(alignment));
        }

        if (protection) {
            children.push(protectionFactory.getTemplate(protection));
        }

        return {
            name: "xf",
            properties: {
                rawMap: {
                    applyAlignment: alignment ? 1 : undefined,
                    applyProtection: protection ? 1 : undefined,
                    applyBorder: borderId ? 1 : undefined,
                    borderId,
                    fillId,
                    applyFont: fontId ? 1 : undefined,
                    fontId,
                    applyNumberFormat: numFmtId ? 1 : undefined,
                    numFmtId,
                    xfId
                }
            },
            children: children.length ? children : undefined
        };
    }
};

export default xfFactory;

export interface Xf {
    alignment?: ExcelAlignment;
    borderId: number;
    fillId: number;
    fontId: number;
    numFmtId: number;
    xfId?: number;
    protection?: ExcelProtection;
}

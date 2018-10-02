import {ExcelOOXMLTemplate, XmlElement, ExcelAlignment} from 'ag-grid-community';
import alignmentFactory from './alignment';

const xfFactory: ExcelOOXMLTemplate = {
    getTemplate(xf: Xf) {
        const {alignment, borderId, fillId, fontId, numFmtId, xfId} = xf;
        let children: XmlElement;
        if (alignment) {
            children = alignmentFactory.getTemplate(alignment);
        }

        return {
            name: "xf",
            properties: {
                rawMap: {
                    applyAlignment: alignment ? 1 : undefined,
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
            children: children ? [children]: undefined
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
}
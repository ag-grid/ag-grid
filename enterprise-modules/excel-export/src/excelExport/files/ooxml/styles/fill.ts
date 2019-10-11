import { ExcelOOXMLTemplate, XmlElement } from 'ag-grid-community';

const fillFactory: ExcelOOXMLTemplate = {
    getTemplate(fill: Fill) {
        const {patternType, fgTheme, fgTint, fgRgb, bgRgb, bgIndexed} = fill;
        const pf: XmlElement = {
            name: 'patternFill',
            properties: {
                rawMap: {
                    patternType
                }
            }
        };

        if (fgTheme || fgTint || fgRgb) {
            pf.children = [{
                name: 'fgColor',
                properties: {
                    rawMap: {
                        theme: fgTheme,
                        tint: fgTint,
                        rgb: fgRgb
                    }
                }
            }];
        }

        if (bgIndexed) {
            if (!pf.children) { pf.children = []; }
            pf.children.push({
                name: 'bgColor',
                properties: {
                    rawMap: {
                        indexed: bgIndexed,
                        rgb: bgRgb
                    }
                }
            });
        }

        return {
            name: "fill",
            children: [pf]
        };
    }
};

export default fillFactory;

export interface Fill {
    patternType: string;
    fgTheme?: string;
    fgTint?: string;
    fgRgb?: string;
    bgIndexed?: string;
    bgRgb?: string;
}

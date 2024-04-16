import { XmlElement } from '@ag-grid-community/core';
import { ExcelOOXMLTemplate } from '@ag-grid-community/core';

const getShapeLayout = (): XmlElement => ({
    name: "o:shapelayout",
    properties: {
        prefixedAttributes: [{
            prefix: "v",
            map: {
                ext: "edit"
            },
        }],
    },
    children: [
        {
            name: "o:idmap",
            properties: {
                prefixedAttributes: [{
                    prefix: "v",
                    map: {
                        ext: "edit",
                        data: "1"
                    },
                }],
            }
        }
    ]
});

const getStroke = (): XmlElement => ({
    name: "v:stroke",
    properties: {
        rawMap: {
            joinstyle: "miter"
        }
    }
});

const getFormulas = (formulas: string[]): XmlElement => ({
    name: "v:formulas",
    children: formulas.map<XmlElement>(formula => ({
        name: "v:f",
        properties: {
            rawMap: {
                eqn: formula
            }
        }
    }))
})

const getPath = (): XmlElement => ({
    name: "v:path",
    properties: {
        rawMap: {
            extrusionok: "f",
            gradientshapeok: "t",
            connecttype: "rect"
        }
    }
});

const getLock = (): XmlElement => ({
    name: "o:lock",
    properties: {
        prefixedAttributes: [{
            prefix: "v",
            map: {
                ext: "edit",
                aspectratio: "t"
            },
        }],
    }
});

const getShapeType = (): XmlElement => {
    const formulas = [
        'if lineDrawn pixelLineWidth 0',
        'sum @0 1 0',
        'sum 0 0 @1',
        'prod @2 1 2',
        'prod @3 21600 pixelWidth',
        'prod @3 21600 pixelHeight',
        'sum @0 0 1',
        'prod @6 1 2',
        'prod @7 21600 pixelWidth',
        'sum @8 21600 0',
        'prod @7 21600 pixelHeight',
        'sum @10 21600 0'
    ];

    return {
        name: "v:shapetype",
        properties: {
            prefixedAttributes: [{
                prefix: "id",
                map: {
                    _x0000_t75: ""
                },
            }],
            rawMap: {
                coordsize: "21600,21600",
                o: "spt",
                preferrelative: "t",
                path: "m@4@5l@4@11@9@11@9@5xe",
                filled: "f",
                stroked: "f"
            }
        },
        children: [
            getStroke(),
            getFormulas(formulas),
            getPath(),
            getLock()
        ],
    }
}


const vmlDrawingFactory: ExcelOOXMLTemplate = {
    getTemplate() {
        const children: XmlElement[] = [getShapeLayout(), getShapeType()];

        return {
            name: "xml",
            properties: {
                prefixedAttributes: [{
                    prefix: "xmlns:",
                    map: {
                        v: "urn:schemas-microsoft-com:vml",
                        o: "urn:schemas-microsoft-com:office:office",
                        x: "urn:schemas-microsoft-com:office:excel"
                    },
                }],
            },
            children
        }
    }
};

export default vmlDrawingFactory;

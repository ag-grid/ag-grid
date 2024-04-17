import { XmlElement } from '@ag-grid-community/core';
import { ExcelOOXMLTemplate } from '@ag-grid-community/core';

const getShapeLayout = (): XmlElement => ({
    name: "o:shapelayout",
    properties: {
        prefixedAttributes: [{
            prefix: "v:",
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
                    prefix: "v:",
                    map: {
                        ext: "edit",
                    },
                }],
                rawMap: {
                    data: '1'
                }
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
        prefixedAttributes: [{
            prefix: "o:",
            map: {
                connecttype: 'rect',
                extrusionok:'f'
            },
        }],
        rawMap: {
            gradientshapeok: "t",
        }
    }
});

const getLock = (params?: { aspectratio?: boolean; rotation?: boolean }): XmlElement => {
    const { aspectratio, rotation } = params || {};
    const rawMap: { aspectratio?: 't'; rotation?: 't'; } = {};

    if (aspectratio) {
        rawMap.aspectratio = 't'
    }

    if (rotation) {
        rawMap.rotation = 't';
    }

    return {
        name: "o:lock",
        properties: {
            prefixedAttributes: [{
                prefix: "v:",
                map: {
                    ext: 'edit'
                },
            }],
            rawMap
        }
    }
};

const getImageData = (): XmlElement => ({
    name: "v:imagedata",
    properties: {
        prefixedAttributes: [{
            prefix: "o:",
            map: {
                relid:'rId1',
                title: 'output-onlinepngtools'
            }
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
                prefix: "o:",
                map: {
                    spt:'75',
                    preferrelative: 't'
                }
            }],
            rawMap: {
                coordsize: "21600,21600",
                filled: "f",
                id: '_x0000_t75',
                path: "m@4@5l@4@11@9@11@9@5xe",
                stroked: "f"
            }
        },
        children: [
            getStroke(),
            getFormulas(formulas),
            getPath(),
            getLock({ aspectratio: true })
        ],
    }
}

const getShape = (): XmlElement => ({
    name: "v:shape",
    properties: {
        rawMap: {
            id: "LH",
            'o:spid': '_x0000_s1025',
            style: "position:absolute;margin-left:0;margin-top:0;width:10in;height:250pt;   z-index:1",
            type:"#_x0000_t75"
        }
    },
    children: [
        getImageData(),
        getLock({ rotation: true })
    ],
});

const vmlDrawingFactory: ExcelOOXMLTemplate = {
    getTemplate() {
        const children: XmlElement[] = [getShapeLayout(), getShapeType(), getShape()];

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

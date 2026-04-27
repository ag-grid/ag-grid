import type { ExcelOOXMLTemplate, XmlElement } from 'ag-grid-community';

import type { ExcelComment } from '../../assets/excelInterfaces';
import { XLSX_WORKSHEET_COMMENTS } from '../../excelXlsxFactory';

const parseCellRef = (ref: string): { row: number; column: number } => {
    let column = 0;
    let index = 0;

    while (index < ref.length) {
        const code = ref.charCodeAt(index);

        if (code < 65 || code > 90) {
            break;
        }

        column = column * 26 + (code - 64);
        index++;
    }

    const row = Number(ref.slice(index));

    return {
        row: row - 1,
        column: column - 1,
    };
};

const getShapeLayout = (): XmlElement => ({
    name: 'o:shapelayout',
    properties: {
        prefixedAttributes: [
            {
                prefix: 'v:',
                map: {
                    ext: 'edit',
                },
            },
        ],
    },
    children: [
        {
            name: 'o:idmap',
            properties: {
                prefixedAttributes: [
                    {
                        prefix: 'v:',
                        map: {
                            ext: 'edit',
                        },
                    },
                ],
                rawMap: {
                    data: '1',
                },
            },
        },
    ],
});

const getShapeType = (): XmlElement => ({
    name: 'v:shapetype',
    properties: {
        prefixedAttributes: [
            {
                prefix: 'o:',
                map: {
                    spt: '202',
                },
            },
        ],
        rawMap: {
            id: '_x0000_t202',
            coordsize: '21600,21600',
            path: 'm0,0l0,21600,21600,21600,21600,0xe',
        },
    },
    children: [
        {
            name: 'v:stroke',
            properties: {
                rawMap: {
                    joinstyle: 'miter',
                },
            },
        },
        {
            name: 'v:path',
            properties: {
                prefixedAttributes: [
                    {
                        prefix: 'o:',
                        map: {
                            connecttype: 'rect',
                        },
                    },
                ],
                rawMap: {
                    gradientshapeok: 't',
                },
            },
        },
    ],
});

const getAnchor = (comment: ExcelComment): string => {
    const { row, column } = parseCellRef(comment.ref);

    return `${column + 1},0,${row + 1},0,${column + 3},20,${row + 5},20`;
};

const getClientData = (comment: ExcelComment): XmlElement => {
    const { row, column } = parseCellRef(comment.ref);

    return {
        name: 'x:ClientData',
        properties: {
            rawMap: {
                ObjectType: 'Note',
            },
        },
        children: [
            {
                name: 'x:MoveWithCells',
            },
            {
                name: 'x:SizeWithCells',
            },
            {
                name: 'x:Anchor',
                textNode: getAnchor(comment),
            },
            {
                name: 'x:AutoFill',
                textNode: 'False',
            },
            {
                name: 'x:Row',
                textNode: String(row),
            },
            {
                name: 'x:Column',
                textNode: String(column),
            },
        ],
    };
};

const getShape = (comment: ExcelComment, idx: number): XmlElement => ({
    name: 'v:shape',
    properties: {
        prefixedAttributes: [
            {
                prefix: 'o:',
                map: {
                    insetmode: 'auto',
                },
            },
        ],
        rawMap: {
            id: `_x0000_s${1025 + idx}`,
            type: '#_x0000_t202',
            style: 'position:absolute;margin-left:80pt;margin-top:5pt;width:104pt;height:64pt;z-index:10;visibility:hidden',
            fillcolor: '#ffffe1',
            strokecolor: '#000000',
        },
    },
    children: [
        {
            name: 'v:fill',
            properties: {
                rawMap: {
                    color2: '#ffffe1',
                },
            },
        },
        {
            name: 'v:shadow',
            properties: {
                rawMap: {
                    color: 'black',
                    obscured: 't',
                },
            },
        },
        {
            name: 'v:path',
            properties: {
                prefixedAttributes: [
                    {
                        prefix: 'o:',
                        map: {
                            connecttype: 'none',
                        },
                    },
                ],
            },
        },
        {
            name: 'v:textbox',
            properties: {
                rawMap: {
                    style: 'mso-direction-alt:auto',
                },
            },
            children: [
                {
                    name: 'div',
                    properties: {
                        rawMap: {
                            style: 'text-align:left',
                        },
                    },
                },
            ],
        },
        getClientData(comment),
    ],
});

const noteVmlDrawingFactory: ExcelOOXMLTemplate = {
    getTemplate(params: { sheetIndex: number }) {
        const comments = XLSX_WORKSHEET_COMMENTS.get(params.sheetIndex) || [];

        return {
            name: 'xml',
            properties: {
                prefixedAttributes: [
                    {
                        prefix: 'xmlns:',
                        map: {
                            v: 'urn:schemas-microsoft-com:vml',
                            o: 'urn:schemas-microsoft-com:office:office',
                            x: 'urn:schemas-microsoft-com:office:excel',
                        },
                    },
                ],
            },
            children: [getShapeLayout(), getShapeType(), ...comments.map((comment, idx) => getShape(comment, idx))],
        };
    },
};

export default noteVmlDrawingFactory;

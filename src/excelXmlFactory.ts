import {XmlElement, XmlFactory} from 'ag-grid/main';
import {Bean, Autowired} from 'ag-grid/main';
import {Utils} from 'ag-grid/main';

var LINE_SEPARATOR = '\r\n';

/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
@Bean('excelXmlFactory')
export class ExcelXmlFactory {

    @Autowired('xmlFactory') private xmlFactory: XmlFactory;

    public createExcelXml(styles: ExcelStyle[], worksheets: ExcelWorksheet[]) :string{
        var documentProperties: XmlElement = this.documentProperties();
        var excelWorkbook = this.excelWorkbook();

        return this.excelXmlHeader() +
            this.xmlFactory.createXml(this.workbook(documentProperties, excelWorkbook, styles, worksheets));
    }

    private workbook(documentProperties: XmlElement, excelWorkbook: XmlElement, styles: ExcelStyle[], worksheets: ExcelWorksheet[]) : XmlElement{
        var children : XmlElement [] = [
            documentProperties,
            excelWorkbook,
            this.stylesXmlElement(styles)
        ];
        Utils.map(worksheets, (it):XmlElement=>{
            return this.worksheetXmlElement (it);
        }).forEach((it)=>{
            children.push(it);
        });

        return {
            name: "Workbook",
            properties: {
                prefix: "xmlns:",
                prefixedMap: {
                    o: "urn:schemas-microsoft-com:office:office",
                    x: "urn:schemas-microsoft-com:office:excel",
                    ss: "urn:schemas-microsoft-com:office:spreadsheet",
                    html: "http://www.w3.org/TR/REC-html40"
                },
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:spreadsheet"
                }
            },
            children: children
        };
    }

    private excelXmlHeader() : string{
        return "<?xml version=\"1.0\"?>" + LINE_SEPARATOR +
            "<?mso-application progid=\"Excel.Sheet\"?>" + LINE_SEPARATOR;
    }

    private stylesXmlElement (styles:ExcelStyle[]):XmlElement{
        return {
            name:"Styles",
            children:styles ? Utils.map(styles, (it)=>{
                return this.styleXmlElement (it);
            }): []
        };
    }

    private styleXmlElement (style:ExcelStyle):XmlElement{
        var borders: XmlElement[] = [];
        if (style.borders){
            [
                style.borders.borderBottom,
                style.borders.borderLeft,
                style.borders.borderRight,
                style.borders.borderTop
            ].forEach((it: ExcelBorder, index: number) => {
                var current = index == 0 ? "Bottom" : index == 1 ? "Left" : index == 2 ? "Right" : "Top";
                borders.push({
                    name: "Border",
                    properties: {
                        prefix: "ss:",
                        prefixedMap: {
                            Position: current,
                            LineStyle: it.lineStyle,
                            Weight: it.weight,
                            Color: it.color
                        }
                    }
                })
            });
        }

        var children:XmlElement[] = [];

        if (style.alignment){
            children.push({
                name: "Alignment",
                properties: {
                    prefix: "ss:",
                    prefixedMap: {
                        Vertical: style.alignment.vertical,
                        Horizontal: style.alignment.horizontal
                    }
                }
            })
        }

        if (style.borders){
            children.push({
                name: "Borders",
                children: borders
            });
        }

        if (style.font){
            children.push({
                name: "Font",
                properties: {
                    prefix: "ss:",
                    prefixedMap: {
                        Color: style.font.color
                    }
                }
            })
        }

        if (style.interior){
            children.push({
                name: "Interior",
                properties: {
                    prefix: "ss:",
                    prefixedMap: {
                        Color: style.interior.color,
                        Pattern: style.interior.pattern
                    }
                }
            })
        }

        return {
            name: "Style",
            properties: {
                prefix: "ss:",
                prefixedMap: {
                    ID: style.id,
                    Name: style.name
                },
            },
            children: children

        }
    }

    private worksheetXmlElement (worksheet:ExcelWorksheet){
        var children:XmlElement[] = [];
        Utils.map(worksheet.table.columns, (it):XmlElement=>{
            return this.columnXmlElement (it);
        }).forEach((it)=>{
            children.push(it);
        });

        Utils.map(worksheet.table.rows, (it):XmlElement=>{
            return this.rowXmlElement (it);
        }).forEach((it)=>{
            children.push(it);
        });

        return {
            name: "Worksheet",
            children:[{
                name:"Table",
                children:children
            }],
            properties:{
                prefix:"ss:",
                prefixedMap: {
                    Name:worksheet.name
                }
            }
        };
    }

    private columnXmlElement (column:ExcelColumn): XmlElement {
        return {
            name:"Column",
            properties:{
                prefix:"ss:",
                prefixedMap: {
                    Width:column.width
                }
            }
        };
    }

    private rowXmlElement (row:ExcelRow): XmlElement {
        return {
            name: "Row",
            children: Utils.map(row.cells, (it:ExcelCell):XmlElement=>{
                return this.rowCellXmlElement (it)
            })
        };
    }

    private rowCellXmlElement(cell: ExcelCell): XmlElement {
        let properties : {[id:string]:string|number}= {};
        if (cell.mergeAcross) {
            properties['MergeAcross'] = cell.mergeAcross;
        }
        if (cell.styleId)
        {
            properties['StyleID'] = cell.styleId;

        }
        return {
            name: "Cell",
            properties: {
                prefix: "ss:",
                prefixedMap: properties
            },
            children: [{
                name: "Data",
                properties: {
                    prefix: "ss:",
                    prefixedMap: {
                        Type: ExcelDataType[cell.data.type]
                    }
                },
                textNode: cell.data.value
            }]
        }

    }

    private excelWorkbook() : XmlElement{
        return {
            name: "ExcelWorkbook",
            properties: {
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:excel"
                }
            },
            children: [{
                name: "WindowHeight",
                textNode: "8130"
            }, {
                name: "WindowWidth",
                textNode: "15135"
            }, {
                name: "WindowHeight",
                textNode: "8130"
            }, {
                name: "WindowTopX",
                textNode: "120"
            }, {
                name: "WindowTopY",
                textNode: "45"
            }, {
                name: "ProtectStructure",
                textNode: "False"

            }, {
                name: "ProtectWindow",
                textNode: "False"
            }]
        };
    }

    private documentProperties()  : XmlElement{
        return {
            name: "DocumentProperties",
            properties: {
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:office"
                }
            },
            children: [{
                name: "Version",
                textNode: "12.00"
            }]
        };
    }


}

export interface ExcelWorksheet {
    name: string
    table: ExcelTable
}

export interface ExcelTable {
    columns: ExcelColumn[]
    rows: ExcelRow[]
}

export interface ExcelColumn {
    width: number
}

export interface ExcelRow {
    cells: ExcelCell[]
}

export interface ExcelCell {
    styleId: string
    data: ExcelData
    mergeAcross?: number
}

export interface ExcelData {
    type: ExcelDataType
    value: string
}

export enum ExcelDataType {
    String, Number
}

export interface ExcelStyle {
    id?: string
    name?: string
    alignment?: ExcelAlignment
    borders?: ExcelBorders
    font?: ExcelFont
    interior?: ExcelInterior
}

export interface ExcelAlignment {
    vertical: string
    horizontal: string
}

export interface ExcelBorders {
    borderBottom: ExcelBorder
    borderLeft: ExcelBorder
    borderTop: ExcelBorder
    borderRight: ExcelBorder
}

export interface ExcelBorder {
    lineStyle: string
    weight: number
    color: string
}

export interface ExcelFont {
    color: string
}

export interface ExcelInterior {
    color: string
    pattern: string
}

export class HorizontalAlign {
    public static LEFT = 'Left';
    public static RIGHT = 'Right';
}

export class VerticalAlign{
    public static BOTTOM = 'BOTTOM';
    public static TOP = 'TOP';
    public static CENTER = 'CENTER';
}

export class LineStyle {
    public static CONTINUOUS = 'CONTINUOUS';
}

export class Pattern {
    public static SOLID = 'SOLID';
}

import {XmlElement, XmlFactory} from 'ag-grid/main';
import {Bean, Autowired} from 'ag-grid/main';
import {
    Utils,
    ExcelStyle,
    ExcelWorksheet,
    ExcelBorder,
    ExcelColumn,
    ExcelRow,
    ExcelCell,
    ExcelData,
    ExcelDataType
} from 'ag-grid/main';

let LINE_SEPARATOR = '\r\n';

/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
@Bean('excelXmlFactory')
export class ExcelXmlFactory {

    @Autowired('xmlFactory') private xmlFactory: XmlFactory;

    public createExcelXml(styles: ExcelStyle[], worksheets: ExcelWorksheet[]) :string{
        let documentProperties: XmlElement = this.documentProperties();
        let excelWorkbook = this.excelWorkbook();

        return this.excelXmlHeader() +
            this.xmlFactory.createXml(this.workbook(documentProperties, excelWorkbook, styles, worksheets), boolean=>boolean?"1":"0");
    }

    private workbook(documentProperties: XmlElement, excelWorkbook: XmlElement, styles: ExcelStyle[], worksheets: ExcelWorksheet[]) : XmlElement{
        let children : XmlElement [] = [
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
                prefixedAttributes:[{
                    prefix: "xmlns:",
                    map: {
                        o: "urn:schemas-microsoft-com:office:office",
                        x: "urn:schemas-microsoft-com:office:excel",
                        ss: "urn:schemas-microsoft-com:office:spreadsheet",
                        html: "http://www.w3.org/TR/REC-html40"
                    },
                }],
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:spreadsheet"
                }
            },
            children: children
        };
    }

    private excelXmlHeader() : string{
        // need to take out the question mark, otherwise it bothers php when have < and ? beside each
        // other in a string, as php thinks it's a directive for php
        let QUESTION_MARK = '?';
        return '<'+QUESTION_MARK+'xml version="1.0"'+QUESTION_MARK+'>' + LINE_SEPARATOR +
            '<'+QUESTION_MARK+'mso-application progid="Excel.Sheet"'+QUESTION_MARK+'>' + LINE_SEPARATOR;
    }

    private stylesXmlElement (styles:ExcelStyle[]):XmlElement{
        return {
            name:'Styles',
            children:styles ? Utils.map(styles, (it)=>{
                return this.styleXmlElement (it);
            }): []
        };
    }

    private styleXmlElement (style:ExcelStyle):XmlElement{
        let borders: XmlElement[] = [];
        if (style.borders){
            [
                style.borders.borderBottom,
                style.borders.borderLeft,
                style.borders.borderRight,
                style.borders.borderTop
            ].forEach((it: ExcelBorder, index: number) => {
                let current = index == 0 ? "Bottom" : index == 1 ? "Left" : index == 2 ? "Right" : "Top";
                borders.push({
                    name: "Border",
                    properties: {
                        prefixedAttributes:[{
                            prefix: "ss:",
                            map: {
                                Position: current,
                                LineStyle: it.lineStyle,
                                Weight: it.weight,
                                Color: it.color
                            }
                        }]
                    }
                })
            });
        }

        let children:XmlElement[] = [];

        if (style.alignment){
            children.push({
                name: "Alignment",
                properties: {
                    prefixedAttributes:[{
                        prefix: "ss:",
                        map: {
                            Vertical: style.alignment.vertical,
                            Horizontal: style.alignment.horizontal,
                            Indent: style.alignment.indent,
                            ReadingOrder: style.alignment.readingOrder,
                            Rotate: style.alignment.rotate,
                            ShrinkToFit: style.alignment.shrinkToFit,
                            VerticalText: style.alignment.verticalText,
                            WrapText: style.alignment.wrapText
                        }
                    }]
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
                    prefixedAttributes:[{
                        prefix: "ss:",
                        map: {
                            Bold: style.font.bold,
                            FontName: style.font.fontName,
                            Italic: style.font.italic,
                            Color: style.font.color,
                            Outline: style.font.outline,
                            Shadow: style.font.shadow,
                            Size: style.font.size,
                            StrikeThrough: style.font.strikeThrough,
                            Underline: style.font.underline,
                            VerticalAlign: style.font.verticalAlign
                        }
                    },{
                        prefix: "x:",
                        map: {
                            CharSet: style.font.charSet,
                            Family: style.font.family
                        }
                    }]
                }
            })
        }

        if (style.interior){
            children.push({
                name: "Interior",
                properties: {
                    prefixedAttributes:[{
                        prefix: "ss:",
                        map: {
                            Color: style.interior.color,
                            Pattern: style.interior.pattern,
                            PatternColor: style.interior.patternColor
                        }
                    }]
                }
            })
        }

        if (style.protection){
            children.push({
                name: "Protection",
                properties: {
                    prefixedAttributes:[{
                        prefix: "ss:",
                        map: {
                            Protected: style.protection.protected,
                            HideFormula: style.protection.hideFormula
                        }
                    }]
                }
            })
        }

        if (style.numberFormat){
            children.push({
                name: "NumberFormat",
                properties: {
                    prefixedAttributes:[{
                        prefix: "ss:",
                        map: {
                            Format: style.numberFormat.format
                        }
                    }]
                }
            })
        }


        return {
            name: "Style",
            properties: {
                prefixedAttributes:[{
                    prefix: "ss:",
                    map: {
                        ID: style.id,
                        Name: (style.name) ?  style.name : style.id
                    }
                }]
            },
            children: children

        }
    }

    private worksheetXmlElement (worksheet:ExcelWorksheet):XmlElement{
        let children:XmlElement[] = [];
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
                prefixedAttributes: [{
                    prefix:"ss:",
                    map: {
                        Name:worksheet.name
                    }
                }]
            }
        };
    }

    private columnXmlElement (column:ExcelColumn): XmlElement {
        return {
            name:"Column",
            properties:{
                prefixedAttributes: [{
                    prefix:"ss:",
                    map: {
                        Width:column.width
                    }
                }]
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
                prefixedAttributes: [{
                    prefix: "ss:",
                    map: properties
                }]
            },
            children: [{
                name: "Data",
                properties: {
                    prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Type: cell.data.type
                        }
                    }]
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
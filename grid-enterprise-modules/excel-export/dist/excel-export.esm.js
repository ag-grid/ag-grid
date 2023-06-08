/**
          * @ag-grid-enterprise/excel-export - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { ExcelFactoryMode, _, Autowired, PostConstruct, Bean, CssClassApplier, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { XmlFactory, BaseGridSerializingSession, RowType, ZipContainer, Downloader, BaseCreator, GridSerializer, CsvCreator, CsvExportModule } from '@ag-grid-community/csv-export';

const workbook = {
    getTemplate() {
        return {
            name: "Workbook",
            properties: {
                prefixedAttributes: [{
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
            }
        };
    }
};

const excelWorkbook = {
    getTemplate() {
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
};

const column = {
    getTemplate(c) {
        const { width } = c;
        return {
            name: "Column",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Width: width
                        }
                    }]
            }
        };
    }
};

const cell = {
    getTemplate(c) {
        const { mergeAcross, styleId, data } = c;
        const properties = {};
        if (mergeAcross) {
            properties.MergeAcross = mergeAcross;
        }
        if (styleId) {
            properties.StyleID = styleId;
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
                                    Type: data === null || data === void 0 ? void 0 : data.type
                                }
                            }]
                    },
                    textNode: data === null || data === void 0 ? void 0 : data.value
                }]
        };
    }
};

const row = {
    getTemplate(r) {
        const { cells } = r;
        return {
            name: "Row",
            children: cells.map(it => cell.getTemplate(it))
        };
    }
};

const worksheet = {
    getTemplate(ws) {
        const { table, name } = ws;
        const { columns, rows } = table;
        const c = columns.map(it => column.getTemplate(it));
        const r = rows.map(it => row.getTemplate(it));
        return {
            name: "Worksheet",
            children: [{
                    name: "Table",
                    children: c.concat(r)
                }],
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Name: name
                        }
                    }]
            }
        };
    }
};

const documentProperties = {
    getTemplate() {
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
};

const alignment = {
    getTemplate(styleProperties) {
        const { vertical, horizontal, indent, readingOrder, rotate, shrinkToFit, verticalText, wrapText } = styleProperties.alignment;
        return {
            name: 'Alignment',
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Vertical: vertical,
                            Horizontal: horizontal,
                            Indent: indent,
                            ReadingOrder: readingOrder,
                            Rotate: rotate,
                            ShrinkToFit: shrinkToFit,
                            VerticalText: verticalText,
                            WrapText: wrapText
                        }
                    }]
            }
        };
    }
};

const borders = {
    getTemplate(styleProperties) {
        const { borderBottom, borderLeft, borderRight, borderTop } = styleProperties.borders;
        return {
            name: 'Borders',
            children: [borderBottom, borderLeft, borderRight, borderTop].map((it, index) => {
                const current = index == 0 ? "Bottom" : index == 1 ? "Left" : index == 2 ? "Right" : "Top";
                return {
                    name: 'Border',
                    properties: {
                        prefixedAttributes: [{
                                prefix: 'ss:',
                                map: {
                                    Position: current,
                                    LineStyle: it.lineStyle,
                                    Weight: it.weight,
                                    Color: it.color
                                }
                            }]
                    }
                };
            })
        };
    }
};

const font = {
    getTemplate(styleProperties) {
        const { bold, fontName, italic, color, outline, shadow, size, strikeThrough, underline, verticalAlign, charSet, family, } = styleProperties.font;
        return {
            name: "Font",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Bold: bold,
                            FontName: fontName,
                            Italic: italic,
                            Color: color,
                            Outline: outline,
                            Shadow: shadow,
                            Size: size,
                            StrikeThrough: strikeThrough,
                            Underline: underline,
                            VerticalAlign: verticalAlign
                        }
                    }, {
                        prefix: "x:",
                        map: {
                            CharSet: charSet,
                            Family: family
                        }
                    }]
            }
        };
    }
};

const interior = {
    getTemplate(styleProperties) {
        const { color, pattern, patternColor } = styleProperties.interior;
        return {
            name: "Interior",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Color: color,
                            Pattern: pattern,
                            PatternColor: patternColor
                        }
                    }]
            }
        };
    }
};

const protection = {
    getTemplate(styleProperties) {
        return {
            name: "Protection",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Protected: styleProperties.protection.protected,
                            HideFormula: styleProperties.protection.hideFormula
                        }
                    }]
            }
        };
    }
};

const numberFormat = {
    getTemplate(styleProperties) {
        const { format } = styleProperties.numberFormat;
        return {
            name: "NumberFormat",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Format: format
                        }
                    }]
            }
        };
    }
};

const style = {
    getTemplate(styleProperties) {
        const { id, name } = styleProperties;
        return {
            name: 'Style',
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            ID: id,
                            Name: name ? name : id
                        }
                    }]
            }
        };
    }
};

/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
class ExcelXmlFactory {
    static createExcel(styles, currentWorksheet) {
        const header = this.excelXmlHeader();
        const docProps = documentProperties.getTemplate();
        const eWorkbook = excelWorkbook.getTemplate();
        const wb = this.workbook(docProps, eWorkbook, styles, currentWorksheet);
        return `${header}${XmlFactory.createXml(wb, boolean => boolean ? '1' : '0')}`;
    }
    static workbook(docProperties, eWorkbook, styles, currentWorksheet) {
        const children = [
            docProperties,
            eWorkbook,
            this.stylesXmlElement(styles)
        ].concat(worksheet.getTemplate(currentWorksheet));
        return Object.assign({}, workbook.getTemplate(), { children });
    }
    static excelXmlHeader() {
        return `<?xml version="1.0" ?>
        <?mso-application progid="Excel.Sheet" ?>
        `;
    }
    static stylesXmlElement(styles) {
        return {
            name: 'Styles',
            children: styles ? styles.map(it => this.styleXmlElement(it)) : []
        };
    }
    static styleXmlElement(styleProperties) {
        const children = _.compose(this.addProperty('alignment', styleProperties), this.addProperty('borders', styleProperties), this.addProperty('font', styleProperties), this.addProperty('interior', styleProperties), this.addProperty('protection', styleProperties), this.addProperty('numberFormat', styleProperties))([]);
        return Object.assign({}, style.getTemplate(styleProperties), { children });
    }
    static addProperty(property, styleProperties) {
        return (children) => {
            if (!styleProperties[property]) {
                return children;
            }
            const options = {
                alignment,
                borders,
                font,
                interior,
                numberFormat,
                protection
            };
            return children.concat(options[property].getTemplate(styleProperties));
        };
    }
}
ExcelXmlFactory.factoryMode = ExcelFactoryMode.SINGLE_SHEET;

const INCH_TO_EMU = 9525;
const numberFormatMap = {
    '0': 1,
    '0.00': 2,
    '#,##0': 3,
    '#,##0.00': 4,
    '0%': 9,
    '0.00%': 10,
    '0.00E+00': 11,
    '# ?/?': 12,
    '# ??/??': 13,
    'mm-dd-yy': 14,
    'd-mmm-yy': 15,
    'd-mmm': 16,
    'mmm-yy': 17,
    'h:mm AM/PM': 18,
    'h:mm:ss AM/PM': 19,
    'h:mm': 20,
    'h:mm:ss': 21,
    'm/d/yy h:mm': 22,
    '#,##0 ;(#,##0)': 37,
    '#,##0 ;[Red](#,##0)': 38,
    '#,##0.00;(#,##0.00)': 39,
    '#,##0.00;[Red](#,##0.00)': 40,
    'mm:ss': 45,
    '[h]:mm:ss': 46,
    'mmss.0': 47,
    '##0.0E+0': 48,
    '@': 49
};

const pixelsToPoint = (pixels) => {
    return Math.round(pixels * 72 / 96);
};
const pointsToPixel = (points) => {
    return Math.round(points * 96 / 72);
};
const pixelsToEMU = (value) => {
    return Math.ceil(value * INCH_TO_EMU);
};
const getFontFamilyId = (name) => {
    if (name === undefined) {
        return;
    }
    const families = ['Automatic', 'Roman', 'Swiss', 'Modern', 'Script', 'Decorative'];
    const pos = families.indexOf(name || 'Automatic');
    return Math.max(pos, 0);
};
const getHeightFromProperty = (rowIndex, height) => {
    if (!height) {
        return;
    }
    let finalHeight;
    if (typeof height === 'number') {
        finalHeight = height;
    }
    else {
        const heightFunc = height;
        finalHeight = heightFunc({ rowIndex });
    }
    return pixelsToPoint(finalHeight);
};
const setExcelImageTotalWidth = (image, columnsToExport) => {
    const { colSpan, column } = image.position;
    if (image.width) {
        if (colSpan) {
            const columnsInSpan = columnsToExport.slice(column - 1, column + colSpan - 1);
            let totalWidth = 0;
            for (let i = 0; i < columnsInSpan.length; i++) {
                const colWidth = columnsInSpan[i].getActualWidth();
                if (image.width < totalWidth + colWidth) {
                    image.position.colSpan = i + 1;
                    image.totalWidth = image.width;
                    image.width = image.totalWidth - totalWidth;
                    break;
                }
                totalWidth += colWidth;
            }
        }
        else {
            image.totalWidth = image.width;
        }
    }
};
const setExcelImageTotalHeight = (image, rowHeight) => {
    const { rowSpan, row } = image.position;
    if (image.height) {
        if (rowSpan) {
            let totalHeight = 0;
            let counter = 0;
            for (let i = row; i < row + rowSpan; i++) {
                const nextRowHeight = pointsToPixel(getHeightFromProperty(i, rowHeight) || 20);
                if (image.height < totalHeight + nextRowHeight) {
                    image.position.rowSpan = counter + 1;
                    image.totalHeight = image.height;
                    image.height = image.totalHeight - totalHeight;
                    break;
                }
                totalHeight += nextRowHeight;
                counter++;
            }
        }
        else {
            image.totalHeight = image.height;
        }
    }
};
const createXmlPart = (body) => {
    const header = XmlFactory.createHeader({
        encoding: 'UTF-8',
        standalone: 'yes'
    });
    const xmlBody = XmlFactory.createXml(body);
    return `${header}${xmlBody}`;
};
const getExcelColumnName = (colIdx) => {
    const startCode = 65;
    const tableWidth = 26;
    const fromCharCode = String.fromCharCode;
    const pos = Math.floor(colIdx / tableWidth);
    const tableIdx = colIdx % tableWidth;
    if (!pos || colIdx === tableWidth) {
        return fromCharCode(startCode + colIdx - 1);
    }
    if (!tableIdx) {
        return getExcelColumnName(pos - 1) + 'Z';
    }
    if (pos < tableWidth) {
        return fromCharCode(startCode + pos - 1) + fromCharCode(startCode + tableIdx - 1);
    }
    return getExcelColumnName(pos) + fromCharCode(startCode + tableIdx - 1);
};

class BaseExcelSerializingSession extends BaseGridSerializingSession {
    constructor(config) {
        super(config);
        this.mixedStyles = {};
        this.mixedStyleCounter = 0;
        this.rows = [];
        this.config = Object.assign({}, config);
        this.stylesByIds = {};
        this.config.baseExcelStyles.forEach(style => {
            this.stylesByIds[style.id] = style;
        });
        this.excelStyles = [...this.config.baseExcelStyles];
    }
    addCustomContent(customContent) {
        customContent.forEach(row => {
            const rowLen = this.rows.length + 1;
            let outlineLevel;
            if (!this.config.suppressRowOutline && row.outlineLevel != null) {
                outlineLevel = row.outlineLevel;
            }
            const rowObj = {
                height: getHeightFromProperty(rowLen, row.height || this.config.rowHeight),
                cells: (row.cells || []).map((cell, idx) => {
                    var _a, _b, _c;
                    const image = this.addImage(rowLen, this.columnsToExport[idx], (_a = cell.data) === null || _a === void 0 ? void 0 : _a.value);
                    let excelStyles = null;
                    if (cell.styleId) {
                        excelStyles = typeof cell.styleId === 'string' ? [cell.styleId] : cell.styleId;
                    }
                    const excelStyleId = this.getStyleId(excelStyles);
                    if (image) {
                        return this.createCell(excelStyleId, this.getDataTypeForValue(image.value), image.value == null ? '' : image.value);
                    }
                    const value = (_c = (_b = cell.data) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : '';
                    const type = this.getDataTypeForValue(value);
                    if (cell.mergeAcross) {
                        return this.createMergedCell(excelStyleId, type, value, cell.mergeAcross);
                    }
                    return this.createCell(excelStyleId, type, value);
                }),
                outlineLevel
            };
            if (row.collapsed != null) {
                rowObj.collapsed = row.collapsed;
            }
            if (row.hidden != null) {
                rowObj.hidden = row.hidden;
            }
            this.rows.push(rowObj);
        });
    }
    onNewHeaderGroupingRow() {
        const currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, this.config.headerRowHeight)
        });
        return {
            onColumn: (columnGroup, header, index, span, collapsibleRanges) => {
                const styleIds = this.config.styleLinker({ rowType: RowType.HEADER_GROUPING, rowIndex: 1, value: `grouping-${header}`, columnGroup });
                currentCells.push(Object.assign(Object.assign({}, this.createMergedCell(this.getStyleId(styleIds), this.getDataTypeForValue('string'), header, span)), { collapsibleRanges }));
            }
        };
    }
    onNewHeaderRow() {
        return this.onNewRow(this.onNewHeaderColumn, this.config.headerRowHeight);
    }
    onNewBodyRow(node) {
        const rowAccumulator = this.onNewRow(this.onNewBodyColumn, this.config.rowHeight);
        if (node) {
            this.addRowOutlineIfNecessary(node);
        }
        return rowAccumulator;
    }
    addRowOutlineIfNecessary(node) {
        const { gridOptionsService, suppressRowOutline, rowGroupExpandState = 'expanded' } = this.config;
        const isGroupHideOpenParents = gridOptionsService.is('groupHideOpenParents');
        if (isGroupHideOpenParents || suppressRowOutline || node.level == null) {
            return;
        }
        const padding = node.footer ? 1 : 0;
        const currentRow = _.last(this.rows);
        currentRow.outlineLevel = node.level + padding;
        if (rowGroupExpandState === 'expanded') {
            return;
        }
        const collapseAll = rowGroupExpandState === 'collapsed';
        if (node.isExpandable()) {
            const isExpanded = !collapseAll && node.expanded;
            currentRow.collapsed = !isExpanded;
        }
        currentRow.hidden =
            // always show the node if there is no parent to be expanded
            !!node.parent &&
                // or if it is a child of the root node
                node.parent.level !== -1 &&
                (collapseAll || this.isAnyParentCollapsed(node.parent));
    }
    isAnyParentCollapsed(node) {
        while (node && node.level !== -1) {
            if (!node.expanded) {
                return true;
            }
            node = node.parent;
        }
        return false;
    }
    prepare(columnsToExport) {
        super.prepare(columnsToExport);
        this.columnsToExport = [...columnsToExport];
        this.cols = columnsToExport.map((col, i) => this.convertColumnToExcel(col, i));
    }
    parse() {
        // adding custom content might have made some rows wider than the grid, so add new columns
        const longestRow = this.rows.reduce((a, b) => Math.max(a, b.cells.length), 0);
        while (this.cols.length < longestRow) {
            this.cols.push(this.convertColumnToExcel(null, this.cols.length + 1));
        }
        const data = {
            name: this.config.sheetName,
            table: {
                columns: this.cols,
                rows: this.rows
            }
        };
        return this.createExcel(data);
    }
    isFormula(value) {
        if (value == null) {
            return false;
        }
        return this.config.autoConvertFormulas && value.toString().startsWith('=');
    }
    isNumerical(value) {
        if (typeof value === 'bigint') {
            return true;
        }
        return isFinite(value) && value !== '' && !isNaN(parseFloat(value));
    }
    getStyleById(styleId) {
        if (styleId == null) {
            return null;
        }
        return this.stylesByIds[styleId] || null;
    }
    convertColumnToExcel(column, index) {
        const columnWidth = this.config.columnWidth;
        if (columnWidth) {
            if (typeof columnWidth === 'number') {
                return { width: columnWidth };
            }
            return { width: columnWidth({ column, index }) };
        }
        if (column) {
            const smallestUsefulWidth = 75;
            return { width: Math.max(column.getActualWidth(), smallestUsefulWidth) };
        }
        return {};
    }
    onNewHeaderColumn(rowIndex, currentCells) {
        return (column, index) => {
            const nameForCol = this.extractHeaderValue(column);
            const styleIds = this.config.styleLinker({ rowType: RowType.HEADER, rowIndex, value: nameForCol, column });
            currentCells.push(this.createCell(this.getStyleId(styleIds), this.getDataTypeForValue('string'), nameForCol));
        };
    }
    onNewRow(onNewColumnAccumulator, height) {
        const currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, height)
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        };
    }
    onNewBodyColumn(rowIndex, currentCells) {
        let skipCols = 0;
        return (column, index, node) => {
            if (skipCols > 0) {
                skipCols -= 1;
                return;
            }
            const { value: valueForCell, valueFormatted } = this.extractRowCellValue(column, index, rowIndex, 'excel', node);
            const styleIds = this.config.styleLinker({ rowType: RowType.BODY, rowIndex, value: valueForCell, column, node });
            const excelStyleId = this.getStyleId(styleIds);
            const colSpan = column.getColSpan(node);
            const addedImage = this.addImage(rowIndex, column, valueForCell);
            if (addedImage) {
                currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(addedImage.value), addedImage.value == null ? '' : addedImage.value));
            }
            else if (colSpan > 1) {
                skipCols = colSpan - 1;
                currentCells.push(this.createMergedCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell, colSpan - 1));
            }
            else {
                currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell, valueFormatted));
            }
        };
    }
    getStyleId(styleIds) {
        if (!styleIds || !styleIds.length) {
            return null;
        }
        if (styleIds.length === 1) {
            return styleIds[0];
        }
        const key = styleIds.join("-");
        if (!this.mixedStyles[key]) {
            this.addNewMixedStyle(styleIds);
        }
        return this.mixedStyles[key].excelID;
    }
    addNewMixedStyle(styleIds) {
        this.mixedStyleCounter += 1;
        const excelId = `mixedStyle${this.mixedStyleCounter}`;
        const resultantStyle = {};
        styleIds.forEach((styleId) => {
            this.excelStyles.forEach((excelStyle) => {
                if (excelStyle.id === styleId) {
                    _.mergeDeep(resultantStyle, _.deepCloneObject(excelStyle));
                }
            });
        });
        resultantStyle.id = excelId;
        resultantStyle.name = excelId;
        const key = styleIds.join("-");
        this.mixedStyles[key] = {
            excelID: excelId,
            key: key,
            result: resultantStyle
        };
        this.excelStyles.push(resultantStyle);
        this.stylesByIds[excelId] = resultantStyle;
    }
}

class ExcelXmlSerializingSession extends BaseExcelSerializingSession {
    createExcel(data) {
        return ExcelXmlFactory.createExcel(this.excelStyles, data);
    }
    getDataTypeForValue(valueForCell) {
        return this.isNumerical(valueForCell) ? 'Number' : 'String';
    }
    getType(type, style, value) {
        if (this.isFormula(value)) {
            return 'Formula';
        }
        if (style && style.dataType) {
            switch (style.dataType.toLocaleLowerCase()) {
                case 'string':
                    return 'Formula';
                case 'number':
                    return 'Number';
                case 'datetime':
                    return 'DateTime';
                case 'error':
                    return 'Error';
                case 'boolean':
                    return 'Boolean';
                default:
                    console.warn(`AG Grid: Unrecognized data type for excel export [${style.id}.dataType=${style.dataType}]`);
            }
        }
        return type;
    }
    addImage() {
        return;
    }
    createCell(styleId, type, value, valueFormatted) {
        const actualStyle = this.getStyleById(styleId);
        if (!(actualStyle === null || actualStyle === void 0 ? void 0 : actualStyle.dataType) && type === 'String' && valueFormatted) {
            value = valueFormatted;
        }
        const typeTransformed = (this.getType(type, actualStyle, value) || type);
        return {
            styleId: !!actualStyle ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: this.getValueTransformed(typeTransformed, value)
            }
        };
    }
    getValueTransformed(typeTransformed, value) {
        const wrapText = (val) => {
            if (this.config.suppressTextAsCDATA) {
                return _.escapeString(val);
            }
            const cdataStart = '<![CDATA[';
            const cdataEnd = ']]>';
            const cdataEndRegex = new RegExp(cdataEnd, "g");
            return cdataStart
                // CDATA sections are closed by the character sequence ']]>' and there is no
                // way of escaping this, so if the text contains the offending sequence, emit
                // multiple CDATA sections and split the characters between them.
                + String(val).replace(cdataEndRegex, ']]' + cdataEnd + cdataStart + '>')
                + cdataEnd;
        };
        const convertBoolean = (val) => {
            if (!val || val === '0' || val === 'false') {
                return '0';
            }
            return '1';
        };
        switch (typeTransformed) {
            case 'String':
                return wrapText(value);
            case 'Number':
                return Number(value).valueOf() + '';
            case 'Boolean':
                return convertBoolean(value);
            default:
                return value;
        }
    }
    createMergedCell(styleId, type, value, numOfCells) {
        return {
            styleId: !!this.getStyleById(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    }
}

const coreFactory = {
    getTemplate(author) {
        const dt = new Date();
        const jsonDate = dt.toJSON();
        return {
            name: 'cp:coreProperties',
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            cp: "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
                            dc: 'http://purl.org/dc/elements/1.1/',
                            dcterms: 'http://purl.org/dc/terms/',
                            dcmitype: 'http://purl.org/dc/dcmitype/',
                            xsi: 'http://www.w3.org/2001/XMLSchema-instance'
                        }
                    }]
            },
            children: [{
                    name: 'dc:creator',
                    textNode: author
                }, {
                    name: 'dc:title',
                    textNode: 'Workbook'
                }, {
                    name: 'dcterms:created',
                    properties: {
                        rawMap: {
                            'xsi:type': 'dcterms:W3CDTF'
                        }
                    },
                    textNode: jsonDate
                }, {
                    name: 'dcterms:modified',
                    properties: {
                        rawMap: {
                            'xsi:type': 'dcterms:W3CDTF'
                        }
                    },
                    textNode: jsonDate
                }]
        };
    }
};

const contentTypeFactory = {
    getTemplate(config) {
        const { name, ContentType, Extension, PartName } = config;
        return {
            name,
            properties: {
                rawMap: {
                    Extension,
                    PartName,
                    ContentType
                }
            }
        };
    }
};

const contentTypesFactory = {
    getTemplate(sheetLen) {
        const worksheets = new Array(sheetLen).fill(undefined).map((v, i) => ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
            PartName: `/xl/worksheets/sheet${i + 1}.xml`
        }));
        const sheetsWithImages = ExcelXlsxFactory.worksheetImages.size;
        const imageTypesObject = {};
        ExcelXlsxFactory.workbookImageIds.forEach((v) => {
            imageTypesObject[v.type] = true;
        });
        const imageDocs = new Array(sheetsWithImages).fill(undefined).map((v, i) => ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.drawing+xml',
            PartName: `/xl/drawings/drawing${i + 1}.xml`
        }));
        const imageTypes = Object.keys(imageTypesObject).map(ext => ({
            name: 'Default',
            ContentType: `image/${ext}`,
            Extension: ext
        }));
        const children = [
            ...imageTypes,
            {
                name: 'Default',
                Extension: 'rels',
                ContentType: 'application/vnd.openxmlformats-package.relationships+xml'
            }, {
                name: 'Default',
                ContentType: 'application/xml',
                Extension: 'xml'
            }, {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
                PartName: "/xl/workbook.xml"
            },
            ...worksheets,
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.theme+xml',
                PartName: '/xl/theme/theme1.xml'
            }, {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml',
                PartName: '/xl/styles.xml'
            }, {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml',
                PartName: '/xl/sharedStrings.xml'
            },
            ...imageDocs,
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-package.core-properties+xml',
                PartName: '/docProps/core.xml'
            }
        ].map(contentType => contentTypeFactory.getTemplate(contentType));
        return {
            name: "Types",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/content-types"
                }
            },
            children
        };
    }
};

const getAnchor = (name, imageAnchor) => ({
    name: `xdr:${name}`,
    children: [{
            name: 'xdr:col',
            textNode: (imageAnchor.col).toString()
        }, {
            name: 'xdr:colOff',
            textNode: imageAnchor.offsetX.toString()
        }, {
            name: 'xdr:row',
            textNode: imageAnchor.row.toString()
        }, {
            name: 'xdr:rowOff',
            textNode: imageAnchor.offsetY.toString()
        }]
});
const getExt = (image) => {
    const children = [{
            name: 'a:ext',
            properties: {
                rawMap: {
                    uri: '{FF2B5EF4-FFF2-40B4-BE49-F238E27FC236}'
                }
            },
            children: [{
                    name: 'a16:creationId',
                    properties: {
                        rawMap: {
                            'id': '{822E6D20-D7BC-2841-A643-D49A6EF008A2}',
                            'xmlns:a16': 'http://schemas.microsoft.com/office/drawing/2014/main'
                        }
                    }
                }]
        }];
    const recolor = image.recolor && image.recolor.toLowerCase();
    switch (recolor) {
        case 'grayscale':
        case 'sepia':
        case 'washout':
            children.push({
                name: 'a:ext',
                properties: {
                    rawMap: {
                        uri: '{C183D7F6-B498-43B3-948B-1728B52AA6E4}'
                    }
                },
                children: [{
                        name: 'adec:decorative',
                        properties: {
                            rawMap: {
                                'val': '0',
                                'xmlns:adec': 'http://schemas.microsoft.com/office/drawing/2017/decorative'
                            }
                        }
                    }]
            });
    }
    return {
        name: 'a:extLst',
        children
    };
};
const getNvPicPr = (image, index) => ({
    name: 'xdr:nvPicPr',
    children: [{
            name: 'xdr:cNvPr',
            properties: {
                rawMap: {
                    id: index,
                    name: image.id,
                    descr: image.altText != null ? image.altText : undefined
                }
            },
            children: [getExt(image)]
        }, {
            name: 'xdr:cNvPicPr',
            properties: {
                rawMap: {
                    preferRelativeResize: '0'
                }
            },
            children: [{
                    name: 'a:picLocks'
                }]
        }]
});
const getColorDetails = (color) => {
    if (!color.saturation && !color.tint) {
        return;
    }
    const ret = [];
    if (color.saturation) {
        ret.push({
            name: 'a:satMod',
            properties: {
                rawMap: {
                    val: color.saturation * 1000
                }
            }
        });
    }
    if (color.tint) {
        ret.push({
            name: 'a:tint',
            properties: {
                rawMap: {
                    val: color.tint * 1000
                }
            }
        });
    }
    return ret;
};
const getDuoTone = (primaryColor, secondaryColor) => {
    return ({
        name: 'a:duotone',
        children: [{
                name: 'a:prstClr',
                properties: {
                    rawMap: {
                        val: primaryColor.color
                    }
                },
                children: getColorDetails(primaryColor)
            }, {
                name: 'a:srgbClr',
                properties: {
                    rawMap: {
                        val: secondaryColor.color
                    }
                },
                children: getColorDetails(secondaryColor)
            }]
    });
};
const getBlipFill = (image, index) => {
    let blipChildren;
    if (image.transparency) {
        const transparency = Math.min(Math.max(image.transparency, 0), 100);
        blipChildren = [{
                name: 'a:alphaModFix',
                properties: {
                    rawMap: {
                        amt: 100000 - Math.round(transparency * 1000),
                    }
                }
            }];
    }
    if (image.recolor) {
        if (!blipChildren) {
            blipChildren = [];
        }
        switch (image.recolor.toLocaleLowerCase()) {
            case 'grayscale':
                blipChildren.push({ name: 'a:grayscl' });
                break;
            case 'sepia':
                blipChildren.push(getDuoTone({ color: 'black' }, { color: 'D9C3A5', tint: 50, saturation: 180 }));
                break;
            case 'washout':
                blipChildren.push({
                    name: 'a:lum',
                    properties: {
                        rawMap: {
                            bright: '70000',
                            contrast: '-70000'
                        }
                    }
                });
                break;
        }
    }
    return ({
        name: 'xdr:blipFill',
        children: [{
                name: 'a:blip',
                properties: {
                    rawMap: {
                        'cstate': 'print',
                        'r:embed': `rId${index}`,
                        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
                    }
                },
                children: blipChildren
            }, {
                name: 'a:stretch',
                children: [{
                        name: 'a:fillRect'
                    }]
            }]
    });
};
const getSpPr = (image, imageBoxSize) => {
    const xfrm = {
        name: 'a:xfrm',
        children: [{
                name: 'a:off',
                properties: {
                    rawMap: {
                        x: 0,
                        y: 0
                    }
                }
            }, {
                name: 'a:ext',
                properties: {
                    rawMap: {
                        cx: imageBoxSize.width,
                        cy: imageBoxSize.height
                    }
                }
            }]
    };
    if (image.rotation) {
        const rotation = image.rotation;
        xfrm.properties = {
            rawMap: {
                rot: Math.min(Math.max(rotation, 0), 360) * 60000
            }
        };
    }
    const prstGeom = {
        name: 'a:prstGeom',
        properties: {
            rawMap: {
                prst: 'rect'
            }
        },
        children: [{ name: 'a:avLst' }]
    };
    const ret = {
        name: 'xdr:spPr',
        children: [xfrm, prstGeom]
    };
    return ret;
};
const getImageBoxSize = (image) => {
    image.fitCell = !!image.fitCell || (!image.width || !image.height);
    const { position = {}, fitCell, width = 0, height = 0, totalHeight, totalWidth } = image;
    const { offsetX = 0, offsetY = 0, row = 1, rowSpan = 1, column = 1, colSpan = 1 } = position;
    return {
        from: {
            row: row - 1,
            col: column - 1,
            offsetX: pixelsToEMU(offsetX),
            offsetY: pixelsToEMU(offsetY)
        },
        to: {
            row: (row - 1) + (fitCell ? 1 : rowSpan - 1),
            col: (column - 1) + (fitCell ? 1 : colSpan - 1),
            offsetX: pixelsToEMU(width + offsetX),
            offsetY: pixelsToEMU(height + offsetY)
        },
        height: pixelsToEMU(totalHeight || height),
        width: pixelsToEMU(totalWidth || width)
    };
};
const getPicture = (image, currentIndex, worksheetImageIndex, imageBoxSize) => {
    return {
        name: 'xdr:pic',
        children: [
            getNvPicPr(image, currentIndex + 1),
            getBlipFill(image, worksheetImageIndex + 1),
            getSpPr(image, imageBoxSize)
        ]
    };
};
const drawingFactory = {
    getTemplate(config) {
        const { sheetIndex } = config;
        const sheetImages = ExcelXlsxFactory.worksheetImages.get(sheetIndex);
        const sheetImageIds = ExcelXlsxFactory.worksheetImageIds.get(sheetIndex);
        const children = sheetImages.map((image, idx) => {
            const boxSize = getImageBoxSize(image);
            return ({
                name: 'xdr:twoCellAnchor',
                properties: {
                    rawMap: {
                        editAs: 'absolute'
                    }
                },
                children: [
                    getAnchor('from', boxSize.from),
                    getAnchor('to', boxSize.to),
                    getPicture(image, idx, sheetImageIds.get(image.id).index, boxSize),
                    { name: 'xdr:clientData' }
                ]
            });
        });
        return {
            name: 'xdr:wsDr',
            properties: {
                rawMap: {
                    'xmlns:a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
                    'xmlns:xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing'
                }
            },
            children
        };
    }
};

const getColorChildren = (props) => {
    const [type, innerType, val, lastClr] = props;
    return {
        name: `a:${type}`,
        children: [{
                name: `a:${innerType}`,
                properties: {
                    rawMap: {
                        val,
                        lastClr
                    }
                }
            }]
    };
};
const colorScheme = {
    getTemplate() {
        return {
            name: "a:clrScheme",
            properties: {
                rawMap: {
                    name: "Office"
                }
            },
            children: [
                getColorChildren(['dk1', 'sysClr', 'windowText', '000000']),
                getColorChildren(['lt1', 'sysClr', 'window', 'FFFFFF']),
                getColorChildren(['dk2', 'srgbClr', '44546A']),
                getColorChildren(['lt2', 'srgbClr', 'E7E6E6']),
                getColorChildren(['accent1', 'srgbClr', '4472C4']),
                getColorChildren(['accent2', 'srgbClr', 'ED7D31']),
                getColorChildren(['accent3', 'srgbClr', 'A5A5A5']),
                getColorChildren(['accent4', 'srgbClr', 'FFC000']),
                getColorChildren(['accent5', 'srgbClr', '5B9BD5']),
                getColorChildren(['accent6', 'srgbClr', '70AD47']),
                getColorChildren(['hlink', 'srgbClr', '0563C1']),
                getColorChildren(['folHlink', 'srgbClr', '954F72'])
            ]
        };
    }
};

const getFont = (props) => {
    const [type, typeface, script, panose] = props;
    return {
        name: `a:${type}`,
        properties: {
            rawMap: {
                script,
                typeface,
                panose
            }
        }
    };
};
const fontScheme = {
    getTemplate() {
        const { utf8_encode } = _;
        return {
            name: "a:fontScheme",
            properties: {
                rawMap: {
                    name: "Office"
                }
            },
            children: [{
                    name: 'a:majorFont',
                    children: [
                        getFont(['latin', 'Calibri Light', undefined, '020F0302020204030204']),
                        getFont(['ea', '']),
                        getFont(['cs', '']),
                        getFont(['font', utf8_encode('游ゴシック Light'), 'Jpan']),
                        getFont(['font', utf8_encode('맑은 고딕'), 'Hang']),
                        getFont(['font', utf8_encode('等线 Light'), 'Hans']),
                        getFont(['font', utf8_encode('新細明體'), 'Hant']),
                        getFont(['font', 'Times New Roman', 'Arab']),
                        getFont(['font', 'Times New Roman', 'Hebr']),
                        getFont(['font', 'Tahoma', 'Thai']),
                        getFont(['font', 'Nyala', 'Ethi']),
                        getFont(['font', 'Vrinda', 'Beng']),
                        getFont(['font', 'Shruti', 'Gujr']),
                        getFont(['font', 'MoolBoran', 'Khmr']),
                        getFont(['font', 'Tunga', 'Knda']),
                        getFont(['font', 'Raavi', 'Guru']),
                        getFont(['font', 'Euphemia', 'Cans']),
                        getFont(['font', 'Plantagenet Cherokee', 'Cher']),
                        getFont(['font', 'Microsoft Yi Baiti', 'Yiii']),
                        getFont(['font', 'Microsoft Himalaya', 'Tibt']),
                        getFont(['font', 'MV Boli', 'Thaa']),
                        getFont(['font', 'Mangal', 'Deva']),
                        getFont(['font', 'Gautami', 'Telu']),
                        getFont(['font', 'Latha', 'Taml']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrc']),
                        getFont(['font', 'Kalinga', 'Orya']),
                        getFont(['font', 'Kartika', 'Mlym']),
                        getFont(['font', 'DokChampa', 'Laoo']),
                        getFont(['font', 'Iskoola Pota', 'Sinh']),
                        getFont(['font', 'Mongolian Baiti', 'Mong']),
                        getFont(['font', 'Times New Roman', 'Viet']),
                        getFont(['font', 'Microsoft Uighur', 'Uigh']),
                        getFont(['font', 'Sylfaen', 'Geor']),
                        getFont(['font', 'Arial', 'Armn']),
                        getFont(['font', 'Leelawadee UI', 'Bugi']),
                        getFont(['font', 'Microsoft JhengHei', 'Bopo']),
                        getFont(['font', 'Javanese Text', 'Java']),
                        getFont(['font', 'Segoe UI', 'Lisu']),
                        getFont(['font', 'Myanmar Text', 'Mymr']),
                        getFont(['font', 'Ebrima', 'Nkoo']),
                        getFont(['font', 'Nirmala UI', 'Olck']),
                        getFont(['font', 'Ebrima', 'Osma']),
                        getFont(['font', 'Phagspa', 'Phag']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrn']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrj']),
                        getFont(['font', 'Estrangelo Edessa', 'Syre']),
                        getFont(['font', 'Nirmala UI', 'Sora']),
                        getFont(['font', 'Microsoft Tai Le', 'Tale']),
                        getFont(['font', 'Microsoft New Tai Lue', 'Talu']),
                        getFont(['font', 'Ebrima', 'Tfng'])
                    ]
                }, {
                    name: 'a:minorFont',
                    children: [
                        getFont(['latin', 'Calibri', undefined, '020F0502020204030204']),
                        getFont(['ea', '']),
                        getFont(['cs', '']),
                        getFont(['font', utf8_encode('游ゴシック'), 'Jpan']),
                        getFont(['font', utf8_encode('맑은 고딕'), 'Hang']),
                        getFont(['font', utf8_encode('等线'), 'Hans']),
                        getFont(['font', utf8_encode('新細明體'), 'Hant']),
                        getFont(['font', 'Arial', 'Arab']),
                        getFont(['font', 'Arial', 'Hebr']),
                        getFont(['font', 'Tahoma', 'Thai']),
                        getFont(['font', 'Nyala', 'Ethi']),
                        getFont(['font', 'Vrinda', 'Beng']),
                        getFont(['font', 'Shruti', 'Gujr']),
                        getFont(['font', 'DaunPenh', 'Khmr']),
                        getFont(['font', 'Tunga', 'Knda']),
                        getFont(['font', 'Raavi', 'Guru']),
                        getFont(['font', 'Euphemia', 'Cans']),
                        getFont(['font', 'Plantagenet Cherokee', 'Cher']),
                        getFont(['font', 'Microsoft Yi Baiti', 'Yiii']),
                        getFont(['font', 'Microsoft Himalaya', 'Tibt']),
                        getFont(['font', 'MV Boli', 'Thaa']),
                        getFont(['font', 'Mangal', 'Deva']),
                        getFont(['font', 'Gautami', 'Telu']),
                        getFont(['font', 'Latha', 'Taml']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrc']),
                        getFont(['font', 'Kalinga', 'Orya']),
                        getFont(['font', 'Kartika', 'Mlym']),
                        getFont(['font', 'DokChampa', 'Laoo']),
                        getFont(['font', 'Iskoola Pota', 'Sinh']),
                        getFont(['font', 'Mongolian Baiti', 'Mong']),
                        getFont(['font', 'Arial', 'Viet']),
                        getFont(['font', 'Microsoft Uighur', 'Uigh']),
                        getFont(['font', 'Sylfaen', 'Geor']),
                        getFont(['font', 'Arial', 'Armn']),
                        getFont(['font', 'Leelawadee UI', 'Bugi']),
                        getFont(['font', 'Microsoft JhengHei', 'Bopo']),
                        getFont(['font', 'Javanese Text', 'Java']),
                        getFont(['font', 'Segoe UI', 'Lisu']),
                        getFont(['font', 'Myanmar Text', 'Mymr']),
                        getFont(['font', 'Ebrima', 'Nkoo']),
                        getFont(['font', 'Nirmala UI', 'Olck']),
                        getFont(['font', 'Ebrima', 'Osma']),
                        getFont(['font', 'Phagspa', 'Phag']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrn']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrj']),
                        getFont(['font', 'Estrangelo Edessa', 'Syre']),
                        getFont(['font', 'Nirmala UI', 'Sora']),
                        getFont(['font', 'Microsoft Tai Le', 'Tale']),
                        getFont(['font', 'Microsoft New Tai Lue', 'Talu']),
                        getFont(['font', 'Ebrima', 'Tfng'])
                    ]
                }]
        };
    }
};

const getPropertyVal = (name, val, children) => ({
    name: `a:${name}`,
    properties: {
        rawMap: {
            val
        }
    },
    children
});
const getGs = (props) => {
    const [pos, schemeColor, satMod, lumMod, tint, shade] = props;
    const children = [];
    children.push(getPropertyVal('satMod', satMod));
    if (lumMod) {
        children.push(getPropertyVal('lumMod', lumMod));
    }
    if (tint) {
        children.push(getPropertyVal('tint', tint));
    }
    if (shade) {
        children.push(getPropertyVal('shade', shade));
    }
    return {
        name: 'a:gs',
        properties: {
            rawMap: {
                pos
            }
        },
        children: [{
                name: 'a:schemeClr',
                properties: {
                    rawMap: {
                        val: schemeColor
                    }
                },
                children
            }]
    };
};
const getSolidFill = (val, children) => ({
    name: 'a:solidFill',
    children: [getPropertyVal('schemeClr', val, children)]
});
const getGradFill = (props) => {
    const [rotWithShape, gs1, gs2, gs3, lin] = props;
    const [ang, scaled] = lin;
    return {
        name: 'a:gradFill',
        properties: {
            rawMap: {
                rotWithShape
            }
        },
        children: [{
                name: 'a:gsLst',
                children: [
                    getGs(gs1),
                    getGs(gs2),
                    getGs(gs3)
                ]
            }, {
                name: 'a:lin',
                properties: {
                    rawMap: {
                        ang: ang,
                        scaled: scaled
                    }
                }
            }]
    };
};
const getLine = (props) => {
    const [w, cap, cmpd, algn] = props;
    return {
        name: 'a:ln',
        properties: {
            rawMap: { w, cap, cmpd, algn }
        },
        children: [
            getSolidFill('phClr'),
            getPropertyVal('prstDash', 'solid'),
            {
                name: 'a:miter',
                properties: {
                    rawMap: {
                        lim: '800000'
                    }
                }
            }
        ]
    };
};
const getEffectStyle = (shadow) => {
    const children = [];
    if (shadow) {
        const [blurRad, dist, dir, algn, rotWithShape] = shadow;
        children.push({
            name: 'a:outerShdw',
            properties: {
                rawMap: { blurRad, dist, dir, algn, rotWithShape }
            },
            children: [
                getPropertyVal('srgbClr', '000000', [getPropertyVal('alpha', '63000')])
            ]
        });
    }
    return {
        name: 'a:effectStyle',
        children: [Object.assign({}, {
                name: 'a:effectLst'
            }, children.length ? { children } : {})]
    };
};
const getFillStyleList = () => ({
    name: 'a:fillStyleLst',
    children: [
        getSolidFill('phClr'),
        getGradFill([
            '1',
            ['0', 'phClr', '105000', '110000', '67000'],
            ['50000', 'phClr', '103000', '105000', '73000'],
            ['100000', 'phClr', '109000', '105000', '81000'],
            ['5400000', '0']
        ]),
        getGradFill([
            '1',
            ['0', 'phClr', '103000', '102000', '94000'],
            ['50000', 'phClr', '110000', '100000', undefined, '100000'],
            ['100000', 'phClr', '120000', '99000', undefined, '78000'],
            ['5400000', '0']
        ])
    ]
});
const getLineStyleList = () => ({
    name: 'a:lnStyleLst',
    children: [
        getLine(['6350', 'flat', 'sng', 'ctr']),
        getLine(['12700', 'flat', 'sng', 'ctr']),
        getLine(['19050', 'flat', 'sng', 'ctr'])
    ]
});
const getEffectStyleList = () => ({
    name: 'a:effectStyleLst',
    children: [
        getEffectStyle(),
        getEffectStyle(),
        getEffectStyle(['57150', '19050', '5400000', 'ctr', '0'])
    ]
});
const getBgFillStyleList = () => ({
    name: 'a:bgFillStyleLst',
    children: [
        getSolidFill('phClr'),
        getSolidFill('phClr', [
            getPropertyVal('tint', '95000'),
            getPropertyVal('satMod', '170000'),
        ]),
        getGradFill([
            '1',
            ['0', 'phClr', '150000', '102000', '93000', '98000'],
            ['50000', 'phClr', '130000', '103000', '98000', '90000'],
            ['100000', 'phClr', '120000', undefined, undefined, '63000'],
            ['5400000', '0']
        ])
    ]
});
const formatScheme = {
    getTemplate() {
        return {
            name: "a:fmtScheme",
            properties: {
                rawMap: {
                    name: "Office"
                }
            },
            children: [
                getFillStyleList(),
                getLineStyleList(),
                getEffectStyleList(),
                getBgFillStyleList()
            ]
        };
    }
};

const themeElements = {
    getTemplate() {
        return {
            name: "a:themeElements",
            children: [
                colorScheme.getTemplate(),
                fontScheme.getTemplate(),
                formatScheme.getTemplate()
            ]
        };
    }
};

const officeTheme = {
    getTemplate() {
        return {
            name: "a:theme",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            a: "http://schemas.openxmlformats.org/drawingml/2006/main"
                        },
                    }],
                rawMap: {
                    name: "Office Theme"
                }
            },
            children: [
                themeElements.getTemplate(),
                {
                    name: 'a:objectDefaults'
                },
                {
                    name: 'a:extraClrSchemeLst'
                }
            ]
        };
    }
};

const buildSharedString = (strMap) => {
    const ret = [];
    strMap.forEach((val, key) => {
        const textNode = key.toString();
        const child = {
            name: 't',
            textNode: _.utf8_encode(_.escapeString(textNode))
        };
        // if we have leading or trailing spaces, instruct Excel not to trim them
        const preserveSpaces = textNode.trim().length !== textNode.length;
        if (preserveSpaces) {
            child.properties = {
                rawMap: {
                    "xml:space": "preserve"
                }
            };
        }
        ret.push({
            name: 'si',
            children: [child]
        });
    });
    return ret;
};
const sharedStrings = {
    getTemplate(strings) {
        return {
            name: "sst",
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    count: strings.size,
                    uniqueCount: strings.size
                }
            },
            children: buildSharedString(strings)
        };
    }
};

const numberFormatFactory = {
    getTemplate(numberFormat) {
        let { formatCode, numFmtId } = numberFormat;
        // excel formulas requires $ to be placed between quotes and symbols to be escaped
        if (formatCode.length) {
            formatCode = _.escapeString(formatCode.replace(/\$/g, '"$"'));
        }
        return {
            name: "numFmt",
            properties: {
                rawMap: {
                    formatCode,
                    numFmtId
                }
            }
        };
    }
};

const numberFormatsFactory = {
    getTemplate(numberFormats) {
        return {
            name: "numFmts",
            properties: {
                rawMap: {
                    count: numberFormats.length
                }
            },
            children: numberFormats.map(numberFormat => numberFormatFactory.getTemplate(numberFormat))
        };
    }
};

const fontFactory = {
    getTemplate(font) {
        const { size, colorTheme, color = 'FF000000', fontName = 'Calibri', family, scheme, italic, bold, strikeThrough, outline, shadow, underline, verticalAlign } = font;
        const children = [
            { name: 'sz', properties: { rawMap: { val: size } } },
            { name: 'color', properties: { rawMap: { theme: colorTheme, rgb: color } } },
            { name: 'name', properties: { rawMap: { val: fontName } } }
        ];
        if (family) {
            children.push({ name: 'family', properties: { rawMap: { val: family } } });
        }
        if (scheme) {
            children.push({ name: 'scheme', properties: { rawMap: { val: scheme } } });
        }
        if (italic) {
            children.push({ name: 'i' });
        }
        if (bold) {
            children.push({ name: 'b' });
        }
        if (strikeThrough) {
            children.push({ name: 'strike' });
        }
        if (outline) {
            children.push({ name: 'outline' });
        }
        if (shadow) {
            children.push({ name: 'shadow' });
        }
        if (underline) {
            children.push({ name: 'u', properties: { rawMap: { val: underline } } });
        }
        if (verticalAlign) {
            children.push({ name: 'vertAlign', properties: { rawMap: { val: verticalAlign } } });
        }
        return { name: "font", children };
    }
};

const fontsFactory = {
    getTemplate(fonts) {
        return {
            name: "fonts",
            properties: {
                rawMap: {
                    count: fonts.length
                }
            },
            children: fonts.map(font => fontFactory.getTemplate(font))
        };
    }
};

const fillFactory = {
    getTemplate(fill) {
        const { patternType, fgTheme, fgTint, fgRgb, bgRgb, bgIndexed } = fill;
        const pf = {
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
        if (bgIndexed || bgRgb) {
            if (!pf.children) {
                pf.children = [];
            }
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

const fillsFactory = {
    getTemplate(fills) {
        return {
            name: "fills",
            properties: {
                rawMap: {
                    count: fills.length
                }
            },
            children: fills.map(fill => fillFactory.getTemplate(fill))
        };
    }
};

const getWeightName = (value) => {
    switch (value) {
        case 1: return 'thin';
        case 2: return 'medium';
        case 3: return 'thick';
        default: return 'hair';
    }
};
const mappedBorderNames = {
    None: 'None',
    Dot: 'Dotted',
    Dash: 'Dashed',
    Double: 'Double',
    DashDot: 'DashDot',
    DashDotDot: 'DashDotDot',
    SlantDashDot: 'SlantDashDot'
};
const mediumBorders = ['Dashed', 'DashDot', 'DashDotDot'];
const colorMap = {
    None: 'none',
    Solid: 'solid',
    Gray50: 'mediumGray',
    Gray75: 'darkGray',
    Gray25: 'lightGray',
    HorzStripe: 'darkHorizontal',
    VertStripe: 'darkVertical',
    ReverseDiagStripe: 'darkDown',
    DiagStripe: 'darkUp',
    DiagCross: 'darkGrid',
    ThickDiagCross: 'darkTrellis',
    ThinHorzStripe: 'lightHorizontal',
    ThinVertStripe: 'lightVertical',
    ThinReverseDiagStripe: 'lightDown',
    ThinDiagStripe: 'lightUp',
    ThinHorzCross: 'lightGrid',
    ThinDiagCross: 'lightTrellis',
    Gray125: 'gray125',
    Gray0625: 'gray0625'
};
const horizontalAlignmentMap = {
    Automatic: 'general',
    Left: 'left',
    Center: 'center',
    Right: 'right',
    Fill: 'fill',
    Justify: 'justify',
    CenterAcrossSelection: 'centerContinuous',
    Distributed: 'distributed',
    JustifyDistributed: 'justify'
};
const verticalAlignmentMap = {
    Automatic: undefined,
    Top: 'top',
    Bottom: 'bottom',
    Center: 'center',
    Justify: 'justify',
    Distributed: 'distributed',
    JustifyDistributed: 'justify'
};
const convertLegacyPattern = (name) => {
    if (!name) {
        return 'none';
    }
    return colorMap[name] || name;
};
const convertLegacyColor = (color) => {
    if (color == undefined) {
        return color;
    }
    if (color.charAt(0) === '#') {
        color = color.substr(1);
    }
    return color.length === 6 ? 'FF' + color : color;
};
const convertLegacyBorder = (type, weight) => {
    if (!type) {
        return 'thin';
    }
    // Legacy Types are: None, Continuous, Dash, Dot, DashDot, DashDotDot, SlantDashDot, and Double
    // Weight represents: 0—Hairline, 1—Thin , 2—Medium, 3—Thick
    // New types: none, thin, medium, dashed, dotted, thick, double, hair, mediumDashed, dashDot, mediumDashDot,
    // dashDotDot, mediumDashDotDot, slantDashDot
    const namedWeight = getWeightName(weight);
    const mappedName = mappedBorderNames[type];
    if (type === 'Continuous') {
        return namedWeight;
    }
    if (namedWeight === 'medium' && mediumBorders.indexOf(mappedName) !== -1) {
        return `medium${mappedName}`;
    }
    return mappedName.charAt(0).toLowerCase() + mappedName.substr(1);
};
const convertLegacyHorizontalAlignment = (alignment) => {
    return horizontalAlignmentMap[alignment] || 'general';
};
const convertLegacyVerticalAlignment = (alignment) => {
    return verticalAlignmentMap[alignment] || undefined;
};

const getBorderColor = (color) => {
    return {
        name: 'color',
        properties: {
            rawMap: {
                rgb: convertLegacyColor(color || '#000000')
            }
        }
    };
};
const borderFactory$1 = {
    getTemplate(border) {
        const { left, right, top, bottom, diagonal } = border;
        const leftChildren = left ? [getBorderColor(left.color)] : undefined;
        const rightChildren = right ? [getBorderColor(right.color)] : undefined;
        const topChildren = top ? [getBorderColor(top.color)] : undefined;
        const bottomChildren = bottom ? [getBorderColor(bottom.color)] : undefined;
        const diagonalChildren = diagonal ? [getBorderColor(diagonal.color)] : undefined;
        return {
            name: 'border',
            children: [{
                    name: 'left',
                    properties: { rawMap: { style: left && left.style } },
                    children: leftChildren
                }, {
                    name: 'right',
                    properties: { rawMap: { style: right && right.style } },
                    children: rightChildren
                }, {
                    name: 'top',
                    properties: { rawMap: { style: top && top.style } },
                    children: topChildren
                }, {
                    name: 'bottom',
                    properties: { rawMap: { style: bottom && bottom.style } },
                    children: bottomChildren
                }, {
                    name: 'diagonal',
                    properties: { rawMap: { style: diagonal && diagonal.style } },
                    children: diagonalChildren
                }]
        };
    }
};

const bordersFactory = {
    getTemplate(borders) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: borders.map(border => borderFactory$1.getTemplate(border))
        };
    }
};

const getReadingOrderId = (readingOrder) => {
    const order = ['Context', 'LeftToRight', 'RightToLeft'];
    const pos = order.indexOf(readingOrder);
    return Math.max(pos, 0);
};
const alignmentFactory = {
    getTemplate(alignment) {
        const { horizontal, indent, readingOrder, rotate, shrinkToFit, vertical, wrapText } = alignment;
        return {
            name: 'alignment',
            properties: {
                rawMap: {
                    horizontal: horizontal && convertLegacyHorizontalAlignment(horizontal),
                    indent,
                    readingOrder: readingOrder && getReadingOrderId(readingOrder),
                    textRotation: rotate,
                    shrinkToFit,
                    vertical: vertical && convertLegacyVerticalAlignment(vertical),
                    wrapText
                }
            }
        };
    }
};

const protectionFactory = {
    getTemplate(protection) {
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

const xfFactory = {
    getTemplate(xf) {
        const { alignment, borderId, fillId, fontId, numFmtId, protection, xfId } = xf;
        const children = [];
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
                    applyFill: fillId ? 1 : undefined,
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

const cellStylesXfsFactory = {
    getTemplate(xfs) {
        return {
            name: "cellStyleXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(xf => xfFactory.getTemplate(xf))
        };
    }
};

const cellXfsFactory = {
    getTemplate(xfs) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(xf => xfFactory.getTemplate(xf))
        };
    }
};

const borderFactory = {
    getTemplate(cellStyle) {
        const { builtinId, name, xfId } = cellStyle;
        return {
            name: "cellStyle",
            properties: {
                rawMap: {
                    builtinId,
                    name,
                    xfId
                }
            }
        };
    }
};

const cellStylesFactory = {
    getTemplate(cellStyles) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: cellStyles.map(cellStyle => borderFactory.getTemplate(cellStyle))
        };
    }
};

let stylesMap;
let registeredNumberFmts;
let registeredFonts;
let registeredFills;
let registeredBorders;
let registeredCellStyleXfs;
let registeredCellXfs;
let registeredCellStyles;
let currentSheet;
const getStyleName = (name, currentSheet) => {
    if (name.indexOf('mixedStyle') !== -1 && currentSheet > 1) {
        name += `_${currentSheet}`;
    }
    return name;
};
const resetStylesheetValues = () => {
    stylesMap = { base: 0 };
    registeredNumberFmts = [];
    registeredFonts = [{ fontName: 'Calibri', colorTheme: '1', family: '2', scheme: 'minor' }];
    registeredFills = [{ patternType: 'none', }, { patternType: 'gray125' }];
    registeredBorders = [{ left: undefined, right: undefined, top: undefined, bottom: undefined, diagonal: undefined }];
    registeredCellStyleXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0 }];
    registeredCellXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0, xfId: 0 }];
    registeredCellStyles = [{ builtinId: 0, name: 'Normal', xfId: 0 }];
};
const registerFill = (fill) => {
    const convertedPattern = convertLegacyPattern(fill.pattern);
    const convertedFillColor = convertLegacyColor(fill.color);
    const convertedPatternColor = convertLegacyColor(fill.patternColor);
    let pos = registeredFills.findIndex(currentFill => {
        const { patternType, fgRgb, bgRgb } = currentFill;
        if (patternType != convertedPattern ||
            fgRgb != convertedFillColor ||
            bgRgb != convertedPatternColor) {
            return false;
        }
        return true;
    });
    if (pos === -1) {
        pos = registeredFills.length;
        registeredFills.push({ patternType: convertedPattern, fgRgb: convertedFillColor, bgRgb: convertedPatternColor });
    }
    return pos;
};
const registerNumberFmt = (format) => {
    format = _.utf8_encode(format);
    if (numberFormatMap[format]) {
        return numberFormatMap[format];
    }
    let pos = registeredNumberFmts.findIndex(currentFormat => currentFormat.formatCode === format);
    if (pos === -1) {
        pos = registeredNumberFmts.length + 164;
        registeredNumberFmts.push({ formatCode: format, numFmtId: pos });
    }
    else {
        pos = registeredNumberFmts[pos].numFmtId;
    }
    return pos;
};
const registerBorders = (borders) => {
    const { borderBottom, borderTop, borderLeft, borderRight } = borders;
    let bottomStyle;
    let topStyle;
    let leftStyle;
    let rightStyle;
    let bottomColor;
    let topColor;
    let leftColor;
    let rightColor;
    if (borderLeft) {
        leftStyle = convertLegacyBorder(borderLeft.lineStyle, borderLeft.weight);
        leftColor = convertLegacyColor(borderLeft.color);
    }
    if (borderRight) {
        rightStyle = convertLegacyBorder(borderRight.lineStyle, borderRight.weight);
        rightColor = convertLegacyColor(borderRight.color);
    }
    if (borderBottom) {
        bottomStyle = convertLegacyBorder(borderBottom.lineStyle, borderBottom.weight);
        bottomColor = convertLegacyColor(borderBottom.color);
    }
    if (borderTop) {
        topStyle = convertLegacyBorder(borderTop.lineStyle, borderTop.weight);
        topColor = convertLegacyColor(borderTop.color);
    }
    let pos = registeredBorders.findIndex(currentBorder => {
        const { left, right, top, bottom } = currentBorder;
        if (!left && (leftStyle || leftColor)) {
            return false;
        }
        if (!right && (rightStyle || rightColor)) {
            return false;
        }
        if (!top && (topStyle || topColor)) {
            return false;
        }
        if (!bottom && (bottomStyle || bottomColor)) {
            return false;
        }
        const { style: clS, color: clC } = left || {};
        const { style: crS, color: crC } = right || {};
        const { style: ctS, color: ctC } = top || {};
        const { style: cbS, color: cbC } = bottom || {};
        if (clS != leftStyle || clC != leftColor) {
            return false;
        }
        if (crS != rightStyle || crC != rightColor) {
            return false;
        }
        if (ctS != topStyle || ctC != topColor) {
            return false;
        }
        if (cbS != bottomStyle || cbC != bottomColor) {
            return false;
        }
        return true;
    });
    if (pos === -1) {
        pos = registeredBorders.length;
        registeredBorders.push({
            left: {
                style: leftStyle, color: leftColor
            },
            right: {
                style: rightStyle, color: rightColor
            },
            top: {
                style: topStyle, color: topColor
            },
            bottom: {
                style: bottomStyle, color: bottomColor
            },
            diagonal: {
                style: undefined,
                color: undefined
            }
        });
    }
    return pos;
};
const registerFont = (font) => {
    const { fontName: name = 'Calibri', color, size, bold, italic, outline, shadow, strikeThrough, underline, family, verticalAlign } = font;
    const utf8Name = name ? _.utf8_encode(name) : name;
    const convertedColor = convertLegacyColor(color);
    const familyId = getFontFamilyId(family);
    const convertedUnderline = underline ? underline.toLocaleLowerCase() : undefined;
    const convertedVerticalAlign = verticalAlign ? verticalAlign.toLocaleLowerCase() : undefined;
    let pos = registeredFonts.findIndex(currentFont => {
        if (currentFont.fontName != utf8Name ||
            currentFont.color != convertedColor ||
            currentFont.size != size ||
            currentFont.bold != bold ||
            currentFont.italic != italic ||
            currentFont.outline != outline ||
            currentFont.shadow != shadow ||
            currentFont.strikeThrough != strikeThrough ||
            currentFont.underline != convertedUnderline ||
            currentFont.verticalAlign != convertedVerticalAlign ||
            // @ts-ignore
            currentFont.family != familyId) {
            return false;
        }
        return true;
    });
    if (pos === -1) {
        pos = registeredFonts.length;
        registeredFonts.push({
            fontName: utf8Name,
            color: convertedColor,
            size,
            bold,
            italic,
            outline,
            shadow,
            strikeThrough,
            underline: convertedUnderline,
            verticalAlign: convertedVerticalAlign,
            family: familyId != null ? familyId.toString() : undefined
        });
    }
    return pos;
};
const registerStyle = (config) => {
    const { alignment, borders, font, interior, numberFormat, protection } = config;
    let { id } = config;
    let currentFill = 0;
    let currentBorder = 0;
    let currentFont = 0;
    let currentNumberFmt = 0;
    if (!id) {
        return;
    }
    id = getStyleName(id, currentSheet);
    if (stylesMap[id] != undefined) {
        return;
    }
    if (interior) {
        currentFill = registerFill(interior);
    }
    if (borders) {
        currentBorder = registerBorders(borders);
    }
    if (font) {
        currentFont = registerFont(font);
    }
    if (numberFormat) {
        currentNumberFmt = registerNumberFmt(numberFormat.format);
    }
    stylesMap[id] = registeredCellXfs.length;
    registeredCellXfs.push({
        alignment,
        borderId: currentBorder || 0,
        fillId: currentFill || 0,
        fontId: currentFont || 0,
        numFmtId: currentNumberFmt || 0,
        protection,
        xfId: 0
    });
};
const stylesheetFactory = {
    getTemplate(defaultFontSize) {
        const numberFormats = numberFormatsFactory.getTemplate(registeredNumberFmts);
        const fonts = fontsFactory.getTemplate(registeredFonts.map(font => (Object.assign(Object.assign({}, font), { size: font.size != null ? font.size : defaultFontSize }))));
        const fills = fillsFactory.getTemplate(registeredFills);
        const borders = bordersFactory.getTemplate(registeredBorders);
        const cellStylesXfs = cellStylesXfsFactory.getTemplate(registeredCellStyleXfs);
        const cellXfs = cellXfsFactory.getTemplate(registeredCellXfs);
        const cellStyles = cellStylesFactory.getTemplate(registeredCellStyles);
        resetStylesheetValues();
        return {
            name: 'styleSheet',
            properties: {
                rawMap: {
                    'mc:Ignorable': 'x14ac x16r2 xr',
                    'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
                    'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac',
                    'xmlns:x16r2': 'http://schemas.microsoft.com/office/spreadsheetml/2015/02/main',
                    'xmlns:xr': 'http://schemas.microsoft.com/office/spreadsheetml/2014/revision'
                }
            },
            children: [
                numberFormats,
                fonts,
                fills,
                borders,
                cellStylesXfs,
                cellXfs,
                cellStyles,
                {
                    name: 'tableStyles',
                    properties: {
                        rawMap: {
                            count: 0,
                            defaultPivotStyle: 'PivotStyleLight16',
                            defaultTableStyle: 'TableStyleMedium2'
                        }
                    }
                }
            ]
        };
    }
};
const getStyleId = (name, currentSheet) => {
    return stylesMap[getStyleName(name, currentSheet)] || 0;
};
const registerStyles = (styles, _currentSheet) => {
    currentSheet = _currentSheet;
    if (currentSheet === 1) {
        resetStylesheetValues();
    }
    styles.forEach(registerStyle);
};

const sheetFactory = {
    getTemplate(name, idx) {
        const sheetId = (idx + 1).toString();
        return {
            name: "sheet",
            properties: {
                rawMap: {
                    "name": name,
                    "sheetId": sheetId,
                    "r:id": `rId${sheetId}`
                }
            }
        };
    }
};

const sheetsFactory = {
    getTemplate(names) {
        return {
            name: "sheets",
            children: names.map((sheet, idx) => sheetFactory.getTemplate(sheet, idx))
        };
    }
};

const workbookFactory = {
    getTemplate(names) {
        return {
            name: "workbook",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                        },
                    }],
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                }
            },
            children: [sheetsFactory.getTemplate(names)]
        };
    }
};

// https://docs.microsoft.com/en-us/office/troubleshoot/excel/determine-column-widths
const getExcelCellWidth = (width) => Math.ceil((width - 12) / 7 + 1);
const columnFactory = {
    getTemplate(config) {
        const { min, max, outlineLevel, s, width, hidden, bestFit } = config;
        let excelWidth = 1;
        let customWidth = '0';
        if (width > 1) {
            excelWidth = getExcelCellWidth(width);
            customWidth = '1';
        }
        return {
            name: 'col',
            properties: {
                rawMap: {
                    min: min,
                    max: max,
                    outlineLevel: outlineLevel != null ? outlineLevel : undefined,
                    width: excelWidth,
                    style: s,
                    hidden: hidden ? '1' : '0',
                    bestFit: bestFit ? '1' : '0',
                    customWidth: customWidth
                }
            }
        };
    }
};

const convertLegacyType = (type) => {
    const t = type.charAt(0).toLowerCase();
    return t === 's' ? 'inlineStr' : t;
};
const cellFactory = {
    getTemplate(config, idx, currentSheet) {
        const { ref, data, styleId } = config;
        const { type, value } = data || { type: 'empty', value: null };
        let convertedType = type;
        if (type === 'f') {
            convertedType = 'str';
        }
        else if (type.charAt(0) === type.charAt(0).toUpperCase()) {
            convertedType = convertLegacyType(type);
        }
        const obj = {
            name: 'c',
            properties: {
                rawMap: {
                    r: ref,
                    t: convertedType === 'empty' ? undefined : convertedType,
                    s: styleId ? getStyleId(styleId, currentSheet) : undefined
                }
            }
        };
        if (convertedType === 'empty') {
            return obj;
        }
        let children;
        if (convertedType === 'str' && type === 'f') {
            children = [{
                    name: 'f',
                    textNode: _.escapeString(_.utf8_encode(value))
                }];
        }
        else if (convertedType === 'inlineStr') {
            children = [{
                    name: 'is',
                    children: [{
                            name: 't',
                            textNode: _.escapeString(_.utf8_encode(value))
                        }]
                }];
        }
        else {
            children = [{
                    name: 'v',
                    textNode: value
                }];
        }
        return Object.assign({}, obj, { children });
    }
};

const addEmptyCells = (cells, rowIdx) => {
    const mergeMap = [];
    let posCounter = 0;
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (cell.mergeAcross) {
            mergeMap.push({
                pos: i,
                excelPos: posCounter
            });
            posCounter += cell.mergeAcross;
        }
        posCounter++;
    }
    if (mergeMap.length) {
        for (let i = mergeMap.length - 1; i >= 0; i--) {
            const mergedCells = [];
            const cell = cells[mergeMap[i].pos];
            for (let j = 1; j <= cell.mergeAcross; j++) {
                mergedCells.push({
                    ref: `${getExcelColumnName(mergeMap[i].excelPos + 1 + j)}${rowIdx + 1}`,
                    styleId: cell.styleId,
                    data: { type: 'empty', value: null }
                });
            }
            if (mergedCells.length) {
                cells.splice(mergeMap[i].pos + 1, 0, ...mergedCells);
            }
        }
    }
};
const shouldDisplayCell = (cell) => { var _a; return ((_a = cell.data) === null || _a === void 0 ? void 0 : _a.value) !== '' || cell.styleId !== undefined; };
const rowFactory = {
    getTemplate(config, idx, currentSheet) {
        const { collapsed, hidden, height, outlineLevel, cells = [] } = config;
        addEmptyCells(cells, idx);
        const children = cells.filter(shouldDisplayCell).map((cell, idx) => cellFactory.getTemplate(cell, idx, currentSheet));
        return {
            name: "row",
            properties: {
                rawMap: {
                    r: idx + 1,
                    collapsed: collapsed ? '1' : '0',
                    hidden: hidden ? '1' : '0',
                    ht: height,
                    customHeight: height != null ? '1' : '0',
                    spans: '1:1',
                    outlineLevel: outlineLevel || undefined
                }
            },
            children
        };
    }
};

const mergeCellFactory = {
    getTemplate(ref) {
        return {
            name: 'mergeCell',
            properties: {
                rawMap: {
                    ref: ref
                }
            }
        };
    }
};

const getMergedCellsAndAddColumnGroups = (rows, cols, suppressColumnOutline) => {
    const mergedCells = [];
    const cellsWithCollapsibleGroups = [];
    rows.forEach((currentRow, rowIdx) => {
        const cells = currentRow.cells;
        let merges = 0;
        let lastCol;
        cells.forEach((currentCell, cellIdx) => {
            const min = cellIdx + merges + 1;
            const start = getExcelColumnName(min);
            const outputRow = rowIdx + 1;
            if (currentCell.mergeAcross) {
                merges += currentCell.mergeAcross;
                const end = getExcelColumnName(cellIdx + merges + 1);
                mergedCells.push(`${start}${outputRow}:${end}${outputRow}`);
            }
            if (!cols[min - 1]) {
                cols[min - 1] = {};
            }
            const { collapsibleRanges } = currentCell;
            if (collapsibleRanges) {
                collapsibleRanges.forEach(range => {
                    cellsWithCollapsibleGroups.push([min + range[0], min + range[1]]);
                });
            }
            lastCol = cols[min - 1];
            lastCol.min = min;
            lastCol.max = min;
            currentCell.ref = `${start}${outputRow}`;
        });
    });
    cellsWithCollapsibleGroups.sort((a, b) => {
        if (a[0] !== b[0]) {
            return a[0] - b[0];
        }
        return b[1] - a[1];
    });
    const rangeMap = new Map();
    const outlineLevel = new Map();
    cellsWithCollapsibleGroups.filter(currentRange => {
        const rangeString = currentRange.toString();
        const inMap = rangeMap.get(rangeString);
        if (inMap) {
            return false;
        }
        rangeMap.set(rangeString, true);
        return true;
    }).forEach(range => {
        const refCol = cols.find(col => col.min == range[0] && col.max == range[1]);
        const currentOutlineLevel = outlineLevel.get(range[0]);
        cols.push({
            min: range[0],
            max: range[1],
            outlineLevel: suppressColumnOutline ? undefined : (currentOutlineLevel || 1),
            width: (refCol || { width: 100 }).width
        });
        outlineLevel.set(range[0], (currentOutlineLevel || 0) + 1);
    });
    return mergedCells;
};
const getPageOrientation = (orientation) => {
    if (!orientation || (orientation !== 'Portrait' && orientation !== 'Landscape')) {
        return 'portrait';
    }
    return orientation.toLocaleLowerCase();
};
const getPageSize = (pageSize) => {
    if (pageSize == null) {
        return 1;
    }
    const positions = ['Letter', 'Letter Small', 'Tabloid', 'Ledger', 'Legal', 'Statement', 'Executive', 'A3', 'A4', 'A4 Small', 'A5', 'A6', 'B4', 'B5', 'Folio', 'Envelope', 'Envelope DL', 'Envelope C5', 'Envelope B5', 'Envelope C3', 'Envelope C4', 'Envelope C6', 'Envelope Monarch', 'Japanese Postcard', 'Japanese Double Postcard'];
    const pos = positions.indexOf(pageSize);
    return pos === -1 ? 1 : (pos + 1);
};
const addColumns = (columns) => {
    return (children) => {
        if (columns.length) {
            children.push({
                name: 'cols',
                children: columns.map(column => columnFactory.getTemplate(column))
            });
        }
        return children;
    };
};
const addSheetData = (rows, sheetNumber) => {
    return (children) => {
        if (rows.length) {
            children.push({
                name: 'sheetData',
                children: rows.map((row, idx) => rowFactory.getTemplate(row, idx, sheetNumber))
            });
        }
        return children;
    };
};
const addMergeCells = (mergeCells) => {
    return (children) => {
        if (mergeCells.length) {
            children.push({
                name: 'mergeCells',
                properties: {
                    rawMap: {
                        count: mergeCells.length
                    }
                },
                children: mergeCells.map(mergedCell => mergeCellFactory.getTemplate(mergedCell))
            });
        }
        return children;
    };
};
const addPageMargins = (margins) => {
    return (children) => {
        const { top = 0.75, right = 0.7, bottom = 0.75, left = 0.7, header = 0.3, footer = 0.3 } = margins;
        children.push({
            name: 'pageMargins',
            properties: {
                rawMap: { bottom, footer, header, left, right, top }
            }
        });
        return children;
    };
};
const addPageSetup = (pageSetup) => {
    return (children) => {
        if (pageSetup) {
            children.push({
                name: 'pageSetup',
                properties: {
                    rawMap: {
                        horizontalDpi: 0,
                        verticalDpi: 0,
                        orientation: getPageOrientation(pageSetup.orientation),
                        paperSize: getPageSize(pageSetup.pageSize)
                    }
                }
            });
        }
        return children;
    };
};
const replaceHeaderFooterTokens = (value) => {
    const map = {
        '&[Page]': '&P',
        '&[Pages]': '&N',
        '&[Date]': '&D',
        '&[Time]': '&T',
        '&[Tab]': '&A',
        '&[Path]': '&Z',
        '&[File]': '&F'
    };
    _.iterateObject(map, (key, val) => {
        value = value.replace(key, val);
    });
    return value;
};
const getHeaderPosition = (position) => {
    if (position === 'Center') {
        return 'C';
    }
    if (position === 'Right') {
        return 'R';
    }
    return 'L';
};
const applyHeaderFontStyle = (headerString, font) => {
    if (!font) {
        return headerString;
    }
    headerString += '&amp;&quot;';
    headerString += font.fontName || 'Calibri';
    if (font.bold !== font.italic) {
        headerString += font.bold ? ',Bold' : ',Italic';
    }
    else if (font.bold) {
        headerString += ',Bold Italic';
    }
    else {
        headerString += ',Regular';
    }
    headerString += '&quot;';
    if (font.size) {
        headerString += `&amp;${font.size}`;
    }
    if (font.strikeThrough) {
        headerString += '&amp;S';
    }
    if (font.underline) {
        headerString += `&amp;${font.underline === 'Double' ? 'E' : 'U'}`;
    }
    if (font.color) {
        headerString += `&amp;K${font.color.replace('#', '').toUpperCase()}`;
    }
    return headerString;
};
const processHeaderFooterContent = (content) => content.reduce((prev, curr) => {
    const pos = getHeaderPosition(curr.position);
    const output = applyHeaderFontStyle(`${prev}&amp;${pos}`, curr.font);
    return `${output}${_.escapeString(replaceHeaderFooterTokens(curr.value))}`;
}, '');
const buildHeaderFooter = (headerFooterConfig) => {
    const rules = ['all', 'first', 'even'];
    const headersAndFooters = [];
    rules.forEach(rule => {
        const headerFooter = headerFooterConfig[rule];
        const namePrefix = rule === 'all' ? 'odd' : rule;
        if (!headerFooter || (!headerFooter.header && !headerFooter.footer)) {
            return;
        }
        _.iterateObject(headerFooter, (key, value) => {
            const nameSuffix = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            if (value) {
                headersAndFooters.push({
                    name: `${namePrefix}${nameSuffix}`,
                    properties: {
                        rawMap: {
                            'xml:space': 'preserve'
                        }
                    },
                    textNode: processHeaderFooterContent(value)
                });
            }
        });
    });
    return headersAndFooters;
};
const addHeaderFooter = (headerFooterConfig) => {
    return (children) => {
        if (!headerFooterConfig) {
            return children;
        }
        const differentFirst = headerFooterConfig.first != null ? 1 : 0;
        const differentOddEven = headerFooterConfig.even != null ? 1 : 0;
        children.push({
            name: 'headerFooter',
            properties: {
                rawMap: {
                    differentFirst,
                    differentOddEven
                }
            },
            children: buildHeaderFooter(headerFooterConfig)
        });
        return children;
    };
};
const addDrawingRel = (currentSheet) => {
    return (children) => {
        if (ExcelXlsxFactory.worksheetImages.get(currentSheet)) {
            children.push({
                name: 'drawing',
                properties: {
                    rawMap: {
                        'r:id': 'rId1'
                    }
                }
            });
        }
        return children;
    };
};
const addSheetPr = () => {
    return (children) => {
        children.push({
            name: 'sheetPr',
            children: [{
                    name: 'outlinePr',
                    properties: {
                        rawMap: {
                            summaryBelow: 0
                        }
                    }
                }]
        });
        return children;
    };
};
const addSheetFormatPr = (rows) => {
    return (children) => {
        const maxOutline = rows.reduce((prev, row) => {
            if (row.outlineLevel && row.outlineLevel > prev) {
                return row.outlineLevel;
            }
            return prev;
        }, 0);
        children.push({
            name: 'sheetFormatPr',
            properties: {
                rawMap: {
                    baseColWidth: 10,
                    defaultRowHeight: 16,
                    outlineLevelRow: maxOutline ? maxOutline : undefined
                }
            }
        });
        return children;
    };
};
const worksheetFactory = {
    getTemplate(params) {
        const { worksheet, currentSheet, config } = params;
        const { margins = {}, pageSetup, headerFooterConfig, suppressColumnOutline } = config;
        const { table } = worksheet;
        const { rows, columns } = table;
        const mergedCells = (columns && columns.length) ? getMergedCellsAndAddColumnGroups(rows, columns, !!suppressColumnOutline) : [];
        const createWorksheetChildren = _.compose(addSheetPr(), addSheetFormatPr(rows), addColumns(columns), addSheetData(rows, currentSheet + 1), addMergeCells(mergedCells), addPageMargins(margins), addPageSetup(pageSetup), addHeaderFooter(headerFooterConfig), addDrawingRel(currentSheet));
        const children = createWorksheetChildren([]);
        return {
            name: "worksheet",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                        }
                    }],
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                }
            },
            children
        };
    }
};

const relationshipFactory = {
    getTemplate(config) {
        const { Id, Type, Target } = config;
        return {
            name: "Relationship",
            properties: {
                rawMap: {
                    Id,
                    Type,
                    Target
                }
            }
        };
    }
};

const relationshipsFactory = {
    getTemplate(c) {
        const children = c.map(relationship => relationshipFactory.getTemplate(relationship));
        return {
            name: "Relationships",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/relationships"
                }
            },
            children
        };
    }
};

/**
 * See https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf
 */
class ExcelXlsxFactory {
    static createExcel(styles, worksheet, config) {
        this.addSheetName(worksheet);
        registerStyles(styles, this.sheetNames.length);
        return this.createWorksheet(worksheet, config);
    }
    static buildImageMap(image, rowIndex, col, columnsToExport, rowHeight) {
        const currentSheetIndex = this.sheetNames.length;
        const registeredImage = this.images.get(image.id);
        if (!image.position || !image.position.row || !image.position.column) {
            if (!image.position) {
                image.position = {};
            }
            image.position = Object.assign({}, image.position, {
                row: rowIndex,
                column: columnsToExport.indexOf(col) + 1
            });
        }
        const calculatedImage = image;
        setExcelImageTotalWidth(calculatedImage, columnsToExport);
        setExcelImageTotalHeight(calculatedImage, rowHeight);
        if (registeredImage) {
            const currentSheetImages = registeredImage.find(currentImage => currentImage.sheetId === currentSheetIndex);
            if (currentSheetImages) {
                currentSheetImages.image.push(calculatedImage);
            }
            else {
                registeredImage.push({
                    sheetId: currentSheetIndex,
                    image: [calculatedImage]
                });
            }
        }
        else {
            this.images.set(calculatedImage.id, [{ sheetId: currentSheetIndex, image: [calculatedImage] }]);
            this.workbookImageIds.set(calculatedImage.id, { type: calculatedImage.imageType, index: this.workbookImageIds.size });
        }
        this.buildSheetImageMap(currentSheetIndex, calculatedImage);
    }
    static buildSheetImageMap(sheetIndex, image) {
        let worksheetImageIdMap = this.worksheetImageIds.get(sheetIndex);
        if (!worksheetImageIdMap) {
            worksheetImageIdMap = new Map();
            this.worksheetImageIds.set(sheetIndex, worksheetImageIdMap);
        }
        const sheetImages = this.worksheetImages.get(sheetIndex);
        if (!sheetImages) {
            this.worksheetImages.set(sheetIndex, [image]);
            worksheetImageIdMap.set(image.id, { index: 0, type: image.imageType });
        }
        else {
            sheetImages.push(image);
            if (!worksheetImageIdMap.get(image.id)) {
                worksheetImageIdMap.set(image.id, { index: worksheetImageIdMap.size, type: image.imageType });
            }
        }
    }
    static addSheetName(worksheet) {
        const name = _.escapeString(worksheet.name) || '';
        let append = '';
        while (this.sheetNames.indexOf(`${name}${append}`) !== -1) {
            if (append === '') {
                append = '_1';
            }
            else {
                const curr = parseInt(append.slice(1), 10);
                append = `_${curr + 1}`;
            }
        }
        worksheet.name = `${name}${append}`;
        this.sheetNames.push(worksheet.name);
    }
    static getStringPosition(str) {
        if (this.sharedStrings.has(str)) {
            return this.sharedStrings.get(str);
        }
        this.sharedStrings.set(str, this.sharedStrings.size);
        return this.sharedStrings.size - 1;
    }
    static resetFactory() {
        this.sharedStrings = new Map();
        this.images = new Map();
        this.worksheetImages = new Map();
        this.workbookImageIds = new Map();
        this.worksheetImageIds = new Map();
        this.sheetNames = [];
        this.factoryMode = ExcelFactoryMode.SINGLE_SHEET;
    }
    static createWorkbook() {
        return createXmlPart(workbookFactory.getTemplate(this.sheetNames));
    }
    static createStylesheet(defaultFontSize) {
        return createXmlPart(stylesheetFactory.getTemplate(defaultFontSize));
    }
    static createSharedStrings() {
        return createXmlPart(sharedStrings.getTemplate(this.sharedStrings));
    }
    static createCore(author) {
        return createXmlPart(coreFactory.getTemplate(author));
    }
    static createContentTypes(sheetLen) {
        return createXmlPart(contentTypesFactory.getTemplate(sheetLen));
    }
    static createRels() {
        const rs = relationshipsFactory.getTemplate([{
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
                Target: 'xl/workbook.xml'
            }, {
                Id: 'rId2',
                Type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
                Target: 'docProps/core.xml'
            }]);
        return createXmlPart(rs);
    }
    static createTheme() {
        return createXmlPart(officeTheme.getTemplate());
    }
    static createWorkbookRels(sheetLen) {
        const worksheets = new Array(sheetLen).fill(undefined).map((v, i) => ({
            Id: `rId${i + 1}`,
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
            Target: `worksheets/sheet${i + 1}.xml`
        }));
        const rs = relationshipsFactory.getTemplate([
            ...worksheets,
            {
                Id: `rId${sheetLen + 1}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
                Target: 'theme/theme1.xml'
            }, {
                Id: `rId${sheetLen + 2}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
                Target: 'styles.xml'
            }, {
                Id: `rId${sheetLen + 3}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
                Target: 'sharedStrings.xml'
            }
        ]);
        return createXmlPart(rs);
    }
    static createDrawing(sheetIndex) {
        return createXmlPart(drawingFactory.getTemplate({ sheetIndex }));
    }
    static createDrawingRel(sheetIndex) {
        const worksheetImageIds = this.worksheetImageIds.get(sheetIndex);
        const XMLArr = [];
        worksheetImageIds.forEach((value, key) => {
            XMLArr.push({
                Id: `rId${value.index + 1}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
                Target: `../media/image${this.workbookImageIds.get(key).index + 1}.${value.type}`
            });
        });
        return createXmlPart(relationshipsFactory.getTemplate(XMLArr));
    }
    static createWorksheetDrawingRel(currentRelationIndex) {
        const rs = relationshipsFactory.getTemplate([{
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing',
                Target: `../drawings/drawing${currentRelationIndex + 1}.xml`
            }]);
        return createXmlPart(rs);
    }
    static createWorksheet(worksheet, config) {
        return createXmlPart(worksheetFactory.getTemplate({
            worksheet,
            currentSheet: this.sheetNames.length - 1,
            config
        }));
    }
}
ExcelXlsxFactory.sharedStrings = new Map();
ExcelXlsxFactory.sheetNames = [];
/** Maps images to sheet */
ExcelXlsxFactory.images = new Map();
/** Maps sheets to images */
ExcelXlsxFactory.worksheetImages = new Map();
/** Maps all workbook images to a global Id */
ExcelXlsxFactory.workbookImageIds = new Map();
/** Maps all sheet images to unique Ids */
ExcelXlsxFactory.worksheetImageIds = new Map();
ExcelXlsxFactory.factoryMode = ExcelFactoryMode.SINGLE_SHEET;

class ExcelXlsxSerializingSession extends BaseExcelSerializingSession {
    createExcel(data) {
        const { excelStyles, config } = this;
        return ExcelXlsxFactory.createExcel(excelStyles, data, config);
    }
    getDataTypeForValue(valueForCell) {
        if (valueForCell === undefined) {
            return 'empty';
        }
        return this.isNumerical(valueForCell) ? 'n' : 's';
    }
    getType(type, style, value) {
        if (this.isFormula(value)) {
            return 'f';
        }
        if (style && style.dataType) {
            switch (style.dataType.toLocaleLowerCase()) {
                case 'formula':
                    return 'f';
                case 'string':
                    return 's';
                case 'number':
                    return 'n';
                case 'datetime':
                    return 'd';
                case 'error':
                    return 'e';
                case 'boolean':
                    return 'b';
                default:
                    console.warn(`AG Grid: Unrecognized data type for excel export [${style.id}.dataType=${style.dataType}]`);
            }
        }
        return type;
    }
    addImage(rowIndex, column, value) {
        if (!this.config.addImageToCell) {
            return;
        }
        const addedImage = this.config.addImageToCell(rowIndex, column, value);
        if (!addedImage) {
            return;
        }
        ExcelXlsxFactory.buildImageMap(addedImage.image, rowIndex, column, this.columnsToExport, this.config.rowHeight);
        return addedImage;
    }
    createCell(styleId, type, value, valueFormatted) {
        const actualStyle = this.getStyleById(styleId);
        if (!(actualStyle === null || actualStyle === void 0 ? void 0 : actualStyle.dataType) && type === 's' && valueFormatted) {
            value = valueFormatted;
        }
        const typeTransformed = this.getType(type, actualStyle, value) || type;
        return {
            styleId: actualStyle ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: this.getCellValue(typeTransformed, value)
            }
        };
    }
    createMergedCell(styleId, type, value, numOfCells) {
        const valueToUse = value == null ? '' : value;
        return {
            styleId: !!this.getStyleById(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: type === 's' ? ExcelXlsxFactory.getStringPosition(valueToUse).toString() : value
            },
            mergeAcross: numOfCells
        };
    }
    getCellValue(type, value) {
        if (value == null) {
            return ExcelXlsxFactory.getStringPosition('').toString();
        }
        switch (type) {
            case 's':
                return value === '' ? '' : ExcelXlsxFactory.getStringPosition(value).toString();
            case 'f':
                return value.slice(1);
            case 'n':
                return Number(value).toString();
            default:
                return value;
        }
    }
}

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const getMultipleSheetsAsExcel = (params) => {
    const { data, fontSize = 11, author = 'AG Grid' } = params;
    const hasImages = ExcelXlsxFactory.images.size > 0;
    ZipContainer.addFolders([
        '_rels/',
        'docProps/',
        'xl/',
        'xl/theme/',
        'xl/_rels/',
        'xl/worksheets/'
    ]);
    if (hasImages) {
        ZipContainer.addFolders([
            'xl/worksheets/_rels',
            'xl/drawings/',
            'xl/drawings/_rels',
            'xl/media/',
        ]);
        let imgCounter = 0;
        ExcelXlsxFactory.images.forEach(value => {
            const firstImage = value[0].image[0];
            const ext = firstImage.imageType;
            ZipContainer.addFile(`xl/media/image${++imgCounter}.${ext}`, firstImage.base64, true);
        });
    }
    if (!data || data.length === 0) {
        console.warn("AG Grid: Invalid params supplied to getMultipleSheetsAsExcel() - `ExcelExportParams.data` is empty.");
        ExcelXlsxFactory.resetFactory();
        return;
    }
    const sheetLen = data.length;
    let imageRelationCounter = 0;
    data.forEach((value, idx) => {
        ZipContainer.addFile(`xl/worksheets/sheet${idx + 1}.xml`, value);
        if (hasImages && ExcelXlsxFactory.worksheetImages.get(idx)) {
            createImageRelationsForSheet(idx, imageRelationCounter++);
        }
    });
    ZipContainer.addFile('xl/workbook.xml', ExcelXlsxFactory.createWorkbook());
    ZipContainer.addFile('xl/styles.xml', ExcelXlsxFactory.createStylesheet(fontSize));
    ZipContainer.addFile('xl/sharedStrings.xml', ExcelXlsxFactory.createSharedStrings());
    ZipContainer.addFile('xl/theme/theme1.xml', ExcelXlsxFactory.createTheme());
    ZipContainer.addFile('xl/_rels/workbook.xml.rels', ExcelXlsxFactory.createWorkbookRels(sheetLen));
    ZipContainer.addFile('docProps/core.xml', ExcelXlsxFactory.createCore(author));
    ZipContainer.addFile('[Content_Types].xml', ExcelXlsxFactory.createContentTypes(sheetLen));
    ZipContainer.addFile('_rels/.rels', ExcelXlsxFactory.createRels());
    ExcelXlsxFactory.resetFactory();
    const mimeType = params.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return ZipContainer.getContent(mimeType);
};
const exportMultipleSheetsAsExcel = (params) => {
    const { fileName = 'export.xlsx' } = params;
    const contents = getMultipleSheetsAsExcel(params);
    if (contents) {
        Downloader.download(fileName, contents);
    }
};
const createImageRelationsForSheet = (sheetIndex, currentRelationIndex) => {
    const drawingFolder = 'xl/drawings';
    const drawingFileName = `${drawingFolder}/drawing${currentRelationIndex + 1}.xml`;
    const relFileName = `${drawingFolder}/_rels/drawing${currentRelationIndex + 1}.xml.rels`;
    const worksheetRelFile = `xl/worksheets/_rels/sheet${sheetIndex + 1}.xml.rels`;
    ZipContainer.addFile(relFileName, ExcelXlsxFactory.createDrawingRel(sheetIndex));
    ZipContainer.addFile(drawingFileName, ExcelXlsxFactory.createDrawing(sheetIndex));
    ZipContainer.addFile(worksheetRelFile, ExcelXlsxFactory.createWorksheetDrawingRel(currentRelationIndex));
};
let ExcelCreator = class ExcelCreator extends BaseCreator {
    constructor() {
        super(...arguments);
        this.exportMode = 'xlsx';
    }
    postConstruct() {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gridOptionsService: this.gridOptionsService
        });
    }
    getMergedParams(params) {
        const baseParams = this.gridOptionsService.get('defaultExcelExportParams');
        return Object.assign({}, baseParams, params);
    }
    getData(params) {
        this.setExportMode(params.exportMode || 'xlsx');
        return super.getData(params);
    }
    export(userParams) {
        if (this.isExportSuppressed()) {
            console.warn(`AG Grid: Export cancelled. Export is not allowed as per your configuration.`);
            return '';
        }
        const mergedParams = this.getMergedParams(userParams);
        const data = this.getData(mergedParams);
        const exportParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType
        };
        const packageFile = this.packageFile(exportParams);
        if (packageFile) {
            Downloader.download(this.getFileName(mergedParams.fileName), packageFile);
        }
        return data;
    }
    exportDataAsExcel(params) {
        return this.export(params);
    }
    getDataAsExcel(params) {
        const mergedParams = this.getMergedParams(params);
        const data = this.getData(mergedParams);
        if (params && params.exportMode === 'xml') {
            return data;
        }
        const exportParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType
        };
        return this.packageFile(exportParams);
    }
    setFactoryMode(factoryMode, exportMode = 'xlsx') {
        const factory = exportMode === 'xlsx' ? ExcelXlsxFactory : ExcelXmlFactory;
        factory.factoryMode = factoryMode;
    }
    getFactoryMode(exportMode) {
        const factory = exportMode === 'xlsx' ? ExcelXlsxFactory : ExcelXmlFactory;
        return factory.factoryMode;
    }
    getSheetDataForExcel(params) {
        const mergedParams = this.getMergedParams(params);
        const data = this.getData(mergedParams);
        return data;
    }
    getMultipleSheetsAsExcel(params) {
        return getMultipleSheetsAsExcel(params);
    }
    exportMultipleSheetsAsExcel(params) {
        return exportMultipleSheetsAsExcel(params);
    }
    getDefaultFileName() {
        return `export.${this.getExportMode()}`;
    }
    getDefaultFileExtension() {
        return this.getExportMode();
    }
    createSerializingSession(params) {
        const { columnModel, valueService, gridOptionsService, valueFormatterService, valueParserService } = this;
        const isXlsx = this.getExportMode() === 'xlsx';
        let sheetName = 'ag-grid';
        if (params.sheetName != null) {
            sheetName = _.utf8_encode(params.sheetName.toString().substr(0, 31));
        }
        const config = Object.assign(Object.assign({}, params), { sheetName,
            columnModel,
            valueService,
            gridOptionsService,
            valueFormatterService,
            valueParserService, headerRowHeight: params.headerRowHeight || params.rowHeight, baseExcelStyles: this.gridOptionsService.get('excelStyles') || [], styleLinker: this.styleLinker.bind(this) });
        return new (isXlsx ? ExcelXlsxSerializingSession : ExcelXmlSerializingSession)(config);
    }
    styleLinker(params) {
        const { rowType, rowIndex, value, column, columnGroup, node } = params;
        const isHeader = rowType === RowType.HEADER;
        const isGroupHeader = rowType === RowType.HEADER_GROUPING;
        const col = (isHeader ? column : columnGroup);
        let headerClasses = [];
        if (isHeader || isGroupHeader) {
            headerClasses.push('header');
            if (isGroupHeader) {
                headerClasses.push('headerGroup');
            }
            if (col) {
                headerClasses = headerClasses.concat(CssClassApplier.getHeaderClassesFromColDef(col.getDefinition(), this.gridOptionsService, column || null, columnGroup || null));
            }
            return headerClasses;
        }
        const styles = this.gridOptionsService.get('excelStyles');
        const applicableStyles = ["cell"];
        if (!styles || !styles.length) {
            return applicableStyles;
        }
        const styleIds = styles.map((it) => {
            return it.id;
        });
        this.stylingService.processAllCellClasses(column.getDefinition(), {
            value,
            data: node.data,
            node: node,
            colDef: column.getDefinition(),
            column: column,
            rowIndex: rowIndex,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        }, (className) => {
            if (styleIds.indexOf(className) > -1) {
                applicableStyles.push(className);
            }
        });
        return applicableStyles.sort((left, right) => {
            return (styleIds.indexOf(left) < styleIds.indexOf(right)) ? -1 : 1;
        });
    }
    isExportSuppressed() {
        return this.gridOptionsService.is('suppressExcelExport');
    }
    setExportMode(exportMode) {
        this.exportMode = exportMode;
    }
    getExportMode() {
        return this.exportMode;
    }
    packageFile(params) {
        if (this.getExportMode() === 'xml') {
            const mimeType = params.mimeType || 'application/vnd.ms-excel';
            return new Blob(["\ufeff", params.data[0]], { type: mimeType });
        }
        return getMultipleSheetsAsExcel(params);
    }
};
__decorate([
    Autowired('columnModel')
], ExcelCreator.prototype, "columnModel", void 0);
__decorate([
    Autowired('valueService')
], ExcelCreator.prototype, "valueService", void 0);
__decorate([
    Autowired('stylingService')
], ExcelCreator.prototype, "stylingService", void 0);
__decorate([
    Autowired('gridSerializer')
], ExcelCreator.prototype, "gridSerializer", void 0);
__decorate([
    Autowired('gridOptionsService')
], ExcelCreator.prototype, "gridOptionsService", void 0);
__decorate([
    Autowired('valueFormatterService')
], ExcelCreator.prototype, "valueFormatterService", void 0);
__decorate([
    Autowired('valueParserService')
], ExcelCreator.prototype, "valueParserService", void 0);
__decorate([
    PostConstruct
], ExcelCreator.prototype, "postConstruct", null);
ExcelCreator = __decorate([
    Bean('excelCreator')
], ExcelCreator);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.0';

const ExcelExportModule = {
    version: VERSION,
    moduleName: ModuleNames.ExcelExportModule,
    beans: [
        // beans in this module
        ExcelCreator,
        // these beans are part of CSV Export module
        GridSerializer, CsvCreator
    ],
    dependantModules: [
        CsvExportModule,
        EnterpriseCoreModule
    ]
};

export { ExcelExportModule, exportMultipleSheetsAsExcel, getMultipleSheetsAsExcel };

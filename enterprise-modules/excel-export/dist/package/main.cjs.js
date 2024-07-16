var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/excel-export/src/main.ts
var main_exports = {};
__export(main_exports, {
  ExcelExportModule: () => ExcelExportModule,
  exportMultipleSheetsAsExcel: () => exportMultipleSheetsAsExcel,
  getMultipleSheetsAsExcel: () => getMultipleSheetsAsExcel
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/excel-export/src/excelExportModule.ts
var import_core9 = require("@ag-grid-community/core");
var import_core10 = require("@ag-grid-enterprise/core");

// enterprise-modules/excel-export/src/excelExport/excelCreator.ts
var import_core8 = require("@ag-grid-community/core");

// enterprise-modules/excel-export/src/excelExport/excelXlsxFactory.ts
var import_core5 = require("@ag-grid-community/core");

// enterprise-modules/excel-export/src/excelExport/files/ooxml/core.ts
var coreFactory = {
  getTemplate(author) {
    const dt = /* @__PURE__ */ new Date();
    const jsonDate = dt.toJSON();
    return {
      name: "cp:coreProperties",
      properties: {
        prefixedAttributes: [{
          prefix: "xmlns:",
          map: {
            cp: "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
            dc: "http://purl.org/dc/elements/1.1/",
            dcterms: "http://purl.org/dc/terms/",
            dcmitype: "http://purl.org/dc/dcmitype/",
            xsi: "http://www.w3.org/2001/XMLSchema-instance"
          }
        }]
      },
      children: [{
        name: "dc:creator",
        textNode: author
      }, {
        name: "dc:title",
        textNode: "Workbook"
      }, {
        name: "dcterms:created",
        properties: {
          rawMap: {
            "xsi:type": "dcterms:W3CDTF"
          }
        },
        textNode: jsonDate
      }, {
        name: "dcterms:modified",
        properties: {
          rawMap: {
            "xsi:type": "dcterms:W3CDTF"
          }
        },
        textNode: jsonDate
      }]
    };
  }
};
var core_default = coreFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/contentType.ts
var contentTypeFactory = {
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
var contentType_default = contentTypeFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/contentTypes.ts
var contentTypesFactory = {
  getTemplate(sheetLen) {
    const worksheets = new Array(sheetLen).fill(void 0).map((v, i) => ({
      name: "Override",
      ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
      PartName: `/xl/worksheets/sheet${i + 1}.xml`
    }));
    const sheetsWithImages = ExcelXlsxFactory.worksheetImages.size;
    const headerFooterImages = ExcelXlsxFactory.worksheetHeaderFooterImages.size;
    const sheetsWithTables = ExcelXlsxFactory.worksheetDataTables.size;
    const imageTypesObject = {};
    ExcelXlsxFactory.workbookImageIds.forEach((v) => {
      const type = v.type === "jpg" ? "jpeg" : v.type;
      imageTypesObject[type] = true;
    });
    const imageDocs = new Array(sheetsWithImages).fill(void 0).map((v, i) => ({
      name: "Override",
      ContentType: "application/vnd.openxmlformats-officedocument.drawing+xml",
      PartName: `/xl/drawings/drawing${i + 1}.xml`
    }));
    const tableDocs = new Array(sheetsWithTables).fill(void 0).map((v, i) => ({
      name: "Override",
      ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml",
      PartName: `/xl/tables/${ExcelXlsxFactory.getTableNameFromIndex(i)}.xml`
    }));
    const imageTypes = Object.keys(imageTypesObject).map((ext) => ({
      name: "Default",
      ContentType: `image/${ext}`,
      Extension: ext
    }));
    if (headerFooterImages) {
      imageTypes.push({
        name: "Default",
        Extension: "vml",
        ContentType: "application/vnd.openxmlformats-officedocument.vmlDrawing"
      });
    }
    const children = [
      ...imageTypes,
      {
        name: "Default",
        Extension: "rels",
        ContentType: "application/vnd.openxmlformats-package.relationships+xml"
      },
      {
        name: "Default",
        ContentType: "application/xml",
        Extension: "xml"
      },
      {
        name: "Override",
        ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
        PartName: "/xl/workbook.xml"
      },
      ...worksheets,
      {
        name: "Override",
        ContentType: "application/vnd.openxmlformats-officedocument.theme+xml",
        PartName: "/xl/theme/theme1.xml"
      },
      {
        name: "Override",
        ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml",
        PartName: "/xl/styles.xml"
      },
      {
        name: "Override",
        ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml",
        PartName: "/xl/sharedStrings.xml"
      },
      ...imageDocs,
      ...tableDocs,
      {
        name: "Override",
        ContentType: "application/vnd.openxmlformats-package.core-properties+xml",
        PartName: "/docProps/core.xml"
      }
    ].map((contentType) => contentType_default.getTemplate(contentType));
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
var contentTypes_default = contentTypesFactory;

// enterprise-modules/excel-export/src/excelExport/assets/excelUtils.ts
var import_csv_export = require("@ag-grid-community/csv-export");

// enterprise-modules/excel-export/src/excelExport/assets/excelConstants.ts
var INCH_TO_EMU = 9525;
var numberFormatMap = {
  "0": 1,
  "0.00": 2,
  "#,##0": 3,
  "#,##0.00": 4,
  "0%": 9,
  "0.00%": 10,
  "0.00E+00": 11,
  "# ?/?": 12,
  "# ??/??": 13,
  "mm-dd-yy": 14,
  "d-mmm-yy": 15,
  "d-mmm": 16,
  "mmm-yy": 17,
  "h:mm AM/PM": 18,
  "h:mm:ss AM/PM": 19,
  "h:mm": 20,
  "h:mm:ss": 21,
  "m/d/yy h:mm": 22,
  "#,##0 ;(#,##0)": 37,
  "#,##0 ;[Red](#,##0)": 38,
  "#,##0.00;(#,##0.00)": 39,
  "#,##0.00;[Red](#,##0.00)": 40,
  "mm:ss": 45,
  "[h]:mm:ss": 46,
  "mmss.0": 47,
  "##0.0E+0": 48,
  "@": 49
};

// enterprise-modules/excel-export/src/excelExport/assets/excelUtils.ts
var pixelsToPoint = (pixels) => {
  return Math.round(pixels * 72 / 96);
};
var pointsToPixel = (points) => {
  return Math.round(points * 96 / 72);
};
var pixelsToEMU = (value) => {
  return Math.ceil(value * INCH_TO_EMU);
};
var getFontFamilyId = (name) => {
  if (name === void 0) {
    return;
  }
  const families = ["Automatic", "Roman", "Swiss", "Modern", "Script", "Decorative"];
  const pos = families.indexOf(name || "Automatic");
  return Math.max(pos, 0);
};
var getHeightFromProperty = (rowIndex, height) => {
  if (!height) {
    return;
  }
  let finalHeight;
  if (typeof height === "number") {
    finalHeight = height;
  } else {
    const heightFunc = height;
    finalHeight = heightFunc({ rowIndex });
  }
  return pixelsToPoint(finalHeight);
};
var setExcelImageTotalWidth = (image, columnsToExport) => {
  const { colSpan, column } = image.position;
  if (!image.width) {
    return;
  }
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
  } else {
    image.totalWidth = image.width;
  }
};
var setExcelImageTotalHeight = (image, rowHeight) => {
  const { rowSpan, row } = image.position;
  if (!image.height) {
    return;
  }
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
  } else {
    image.totalHeight = image.height;
  }
};
var createXmlPart = (body, skipHeader) => {
  const header = import_csv_export.XmlFactory.createHeader({
    encoding: "UTF-8",
    standalone: "yes"
  });
  const xmlBody = import_csv_export.XmlFactory.createXml(body);
  if (skipHeader) {
    return xmlBody;
  }
  return `${header}${xmlBody}`;
};
var getExcelColumnName = (colIdx) => {
  const startCode = 65;
  const tableWidth = 26;
  const fromCharCode = String.fromCharCode;
  const pos = Math.floor(colIdx / tableWidth);
  const tableIdx = colIdx % tableWidth;
  if (!pos || colIdx === tableWidth) {
    return fromCharCode(startCode + colIdx - 1);
  }
  if (!tableIdx) {
    return getExcelColumnName(pos - 1) + "Z";
  }
  if (pos < tableWidth) {
    return fromCharCode(startCode + pos - 1) + fromCharCode(startCode + tableIdx - 1);
  }
  return getExcelColumnName(pos) + fromCharCode(startCode + tableIdx - 1);
};

// enterprise-modules/excel-export/src/excelExport/files/ooxml/drawing.ts
var getAnchor = (name, imageAnchor) => ({
  name: `xdr:${name}`,
  children: [{
    name: "xdr:col",
    textNode: imageAnchor.col.toString()
  }, {
    name: "xdr:colOff",
    textNode: imageAnchor.offsetX.toString()
  }, {
    name: "xdr:row",
    textNode: imageAnchor.row.toString()
  }, {
    name: "xdr:rowOff",
    textNode: imageAnchor.offsetY.toString()
  }]
});
var getExt = (image) => {
  const children = [{
    name: "a:ext",
    properties: {
      rawMap: {
        uri: "{FF2B5EF4-FFF2-40B4-BE49-F238E27FC236}"
      }
    },
    children: [{
      name: "a16:creationId",
      properties: {
        rawMap: {
          "id": "{822E6D20-D7BC-2841-A643-D49A6EF008A2}",
          "xmlns:a16": "http://schemas.microsoft.com/office/drawing/2014/main"
        }
      }
    }]
  }];
  const recolor = image.recolor && image.recolor.toLowerCase();
  switch (recolor) {
    case "grayscale":
    case "sepia":
    case "washout":
      children.push({
        name: "a:ext",
        properties: {
          rawMap: {
            uri: "{C183D7F6-B498-43B3-948B-1728B52AA6E4}"
          }
        },
        children: [{
          name: "adec:decorative",
          properties: {
            rawMap: {
              "val": "0",
              "xmlns:adec": "http://schemas.microsoft.com/office/drawing/2017/decorative"
            }
          }
        }]
      });
  }
  return {
    name: "a:extLst",
    children
  };
};
var getNvPicPr = (image, index) => ({
  name: "xdr:nvPicPr",
  children: [{
    name: "xdr:cNvPr",
    properties: {
      rawMap: {
        id: index,
        name: image.id,
        descr: image.altText != null ? image.altText : void 0
      }
    },
    children: [getExt(image)]
  }, {
    name: "xdr:cNvPicPr",
    properties: {
      rawMap: {
        preferRelativeResize: "0"
      }
    },
    children: [{
      name: "a:picLocks"
    }]
  }]
});
var getColorDetails = (color) => {
  if (!color.saturation && !color.tint) {
    return;
  }
  const ret = [];
  if (color.saturation) {
    ret.push({
      name: "a:satMod",
      properties: {
        rawMap: {
          val: color.saturation * 1e3
        }
      }
    });
  }
  if (color.tint) {
    ret.push({
      name: "a:tint",
      properties: {
        rawMap: {
          val: color.tint * 1e3
        }
      }
    });
  }
  return ret;
};
var getDuoTone = (primaryColor, secondaryColor) => {
  return {
    name: "a:duotone",
    children: [{
      name: "a:prstClr",
      properties: {
        rawMap: {
          val: primaryColor.color
        }
      },
      children: getColorDetails(primaryColor)
    }, {
      name: "a:srgbClr",
      properties: {
        rawMap: {
          val: secondaryColor.color
        }
      },
      children: getColorDetails(secondaryColor)
    }]
  };
};
var getBlipFill = (image, index) => {
  let blipChildren;
  if (image.transparency) {
    const transparency = Math.min(Math.max(image.transparency, 0), 100);
    blipChildren = [{
      name: "a:alphaModFix",
      properties: {
        rawMap: {
          amt: 1e5 - Math.round(transparency * 1e3)
        }
      }
    }];
  }
  if (image.recolor) {
    if (!blipChildren) {
      blipChildren = [];
    }
    switch (image.recolor.toLocaleLowerCase()) {
      case "grayscale":
        blipChildren.push({ name: "a:grayscl" });
        break;
      case "sepia":
        blipChildren.push(getDuoTone({ color: "black" }, { color: "D9C3A5", tint: 50, saturation: 180 }));
        break;
      case "washout":
        blipChildren.push({
          name: "a:lum",
          properties: {
            rawMap: {
              bright: "70000",
              contrast: "-70000"
            }
          }
        });
        break;
      default:
    }
  }
  return {
    name: "xdr:blipFill",
    children: [{
      name: "a:blip",
      properties: {
        rawMap: {
          "cstate": "print",
          "r:embed": `rId${index}`,
          "xmlns:r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
        }
      },
      children: blipChildren
    }, {
      name: "a:stretch",
      children: [{
        name: "a:fillRect"
      }]
    }]
  };
};
var getSpPr = (image, imageBoxSize) => {
  const xfrm = {
    name: "a:xfrm",
    children: [{
      name: "a:off",
      properties: {
        rawMap: {
          x: 0,
          y: 0
        }
      }
    }, {
      name: "a:ext",
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
        rot: Math.min(Math.max(rotation, 0), 360) * 6e4
      }
    };
  }
  const prstGeom = {
    name: "a:prstGeom",
    properties: {
      rawMap: {
        prst: "rect"
      }
    },
    children: [{ name: "a:avLst" }]
  };
  const ret = {
    name: "xdr:spPr",
    children: [xfrm, prstGeom]
  };
  return ret;
};
var getImageBoxSize = (image) => {
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
      row: row - 1 + (fitCell ? 1 : rowSpan - 1),
      col: column - 1 + (fitCell ? 1 : colSpan - 1),
      offsetX: pixelsToEMU(width + offsetX),
      offsetY: pixelsToEMU(height + offsetY)
    },
    height: pixelsToEMU(totalHeight || height),
    width: pixelsToEMU(totalWidth || width)
  };
};
var getPicture = (image, currentIndex, worksheetImageIndex, imageBoxSize) => {
  return {
    name: "xdr:pic",
    children: [
      getNvPicPr(image, currentIndex + 1),
      getBlipFill(image, worksheetImageIndex + 1),
      getSpPr(image, imageBoxSize)
    ]
  };
};
var drawingFactory = {
  getTemplate(config) {
    const { sheetIndex } = config;
    const sheetImages = ExcelXlsxFactory.worksheetImages.get(sheetIndex);
    const sheetImageIds = ExcelXlsxFactory.worksheetImageIds.get(sheetIndex);
    const children = sheetImages.map((image, idx) => {
      const boxSize = getImageBoxSize(image);
      return {
        name: "xdr:twoCellAnchor",
        properties: {
          rawMap: {
            editAs: "absolute"
          }
        },
        children: [
          getAnchor("from", boxSize.from),
          getAnchor("to", boxSize.to),
          getPicture(image, idx, sheetImageIds.get(image.id).index, boxSize),
          { name: "xdr:clientData" }
        ]
      };
    });
    return {
      name: "xdr:wsDr",
      properties: {
        rawMap: {
          "xmlns:a": "http://schemas.openxmlformats.org/drawingml/2006/main",
          "xmlns:xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"
        }
      },
      children
    };
  }
};
var drawing_default = drawingFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/table.ts
var tableFactory = {
  getTemplate(dataTable, idx) {
    const {
      name,
      columns,
      rowCount,
      displayName,
      headerRowIndex,
      showRowStripes,
      showColumnStripes,
      showFilterButtons,
      highlightFirstColumn,
      highlightLastColumn
    } = dataTable || {};
    if (!dataTable || !name || !Array.isArray(columns) || !columns.length || !rowCount) {
      return { name: "table" };
    }
    const filterColumns = columns.map((col, idx2) => ({
      name: "filterColumn",
      properties: {
        rawMap: {
          colId: idx2.toString(),
          // For filters, this should start with 0
          hiddenButton: showFilterButtons[idx2] ? 0 : 1
        }
      }
    }));
    const firstRow = headerRowIndex + 1;
    const id = (idx + 1).toString();
    const firstCell = `A${firstRow}`;
    const lastCell = `${String.fromCharCode(64 + columns.length)}${firstRow + rowCount}`;
    const ref = `${firstCell}:${lastCell}`;
    const displayNameToUse = idx ? `${displayName}_${idx + 1}` : displayName;
    return {
      name: "table",
      properties: {
        rawMap: {
          "xmlns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
          "xmlns:mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
          "mc:Ignorable": "xr xr3",
          "xmlns:xr": "http://schemas.microsoft.com/office/spreadsheetml/2014/revision",
          "xmlns:xr3": "http://schemas.microsoft.com/office/spreadsheetml/2016/revision3",
          "name": name,
          "displayName": displayNameToUse,
          "ref": ref,
          "totalsRowShown": 0,
          "id": id
        }
      },
      children: [
        {
          name: "autoFilter",
          properties: {
            rawMap: {
              ref
            }
          },
          children: filterColumns
        },
        {
          name: "tableColumns",
          properties: {
            rawMap: {
              count: columns.length
            }
          },
          children: columns.map((col, idx2) => ({
            name: "tableColumn",
            properties: {
              rawMap: {
                id: (idx2 + 1).toString(),
                name: col,
                dataCellStyle: "Normal"
              }
            }
          }))
        },
        {
          name: "tableStyleInfo",
          properties: {
            rawMap: {
              name: "TableStyleLight1",
              showFirstColumn: highlightFirstColumn ? 1 : 0,
              showLastColumn: highlightLastColumn ? 1 : 0,
              showRowStripes: showRowStripes ? 1 : 0,
              showColumnStripes: showColumnStripes ? 1 : 0
            }
          }
        }
      ]
    };
  }
};
var table_default = tableFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/themes/office/colorScheme.ts
var getColorChildren = (props) => {
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
var colorScheme = {
  getTemplate() {
    return {
      name: "a:clrScheme",
      properties: {
        rawMap: {
          name: "Office"
        }
      },
      children: [
        getColorChildren(["dk1", "sysClr", "windowText", "000000"]),
        getColorChildren(["lt1", "sysClr", "window", "FFFFFF"]),
        getColorChildren(["dk2", "srgbClr", "44546A"]),
        getColorChildren(["lt2", "srgbClr", "E7E6E6"]),
        getColorChildren(["accent1", "srgbClr", "4472C4"]),
        getColorChildren(["accent2", "srgbClr", "ED7D31"]),
        getColorChildren(["accent3", "srgbClr", "A5A5A5"]),
        getColorChildren(["accent4", "srgbClr", "FFC000"]),
        getColorChildren(["accent5", "srgbClr", "5B9BD5"]),
        getColorChildren(["accent6", "srgbClr", "70AD47"]),
        getColorChildren(["hlink", "srgbClr", "0563C1"]),
        getColorChildren(["folHlink", "srgbClr", "954F72"])
      ]
    };
  }
};
var colorScheme_default = colorScheme;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/themes/office/fontScheme.ts
var getFont = (props) => {
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
var fontScheme = {
  getTemplate() {
    return {
      name: "a:fontScheme",
      properties: {
        rawMap: {
          name: "Office"
        }
      },
      children: [{
        name: "a:majorFont",
        children: [
          getFont(["latin", "Calibri Light", void 0, "020F0302020204030204"]),
          getFont(["ea", ""]),
          getFont(["cs", ""]),
          getFont(["font", "\u6E38\u30B4\u30B7\u30C3\u30AF Light", "Jpan"]),
          getFont(["font", "\uB9D1\uC740 \uACE0\uB515", "Hang"]),
          getFont(["font", "\u7B49\u7EBF Light", "Hans"]),
          getFont(["font", "\u65B0\u7D30\u660E\u9AD4", "Hant"]),
          getFont(["font", "Times New Roman", "Arab"]),
          getFont(["font", "Times New Roman", "Hebr"]),
          getFont(["font", "Tahoma", "Thai"]),
          getFont(["font", "Nyala", "Ethi"]),
          getFont(["font", "Vrinda", "Beng"]),
          getFont(["font", "Shruti", "Gujr"]),
          getFont(["font", "MoolBoran", "Khmr"]),
          getFont(["font", "Tunga", "Knda"]),
          getFont(["font", "Raavi", "Guru"]),
          getFont(["font", "Euphemia", "Cans"]),
          getFont(["font", "Plantagenet Cherokee", "Cher"]),
          getFont(["font", "Microsoft Yi Baiti", "Yiii"]),
          getFont(["font", "Microsoft Himalaya", "Tibt"]),
          getFont(["font", "MV Boli", "Thaa"]),
          getFont(["font", "Mangal", "Deva"]),
          getFont(["font", "Gautami", "Telu"]),
          getFont(["font", "Latha", "Taml"]),
          getFont(["font", "Estrangelo Edessa", "Syrc"]),
          getFont(["font", "Kalinga", "Orya"]),
          getFont(["font", "Kartika", "Mlym"]),
          getFont(["font", "DokChampa", "Laoo"]),
          getFont(["font", "Iskoola Pota", "Sinh"]),
          getFont(["font", "Mongolian Baiti", "Mong"]),
          getFont(["font", "Times New Roman", "Viet"]),
          getFont(["font", "Microsoft Uighur", "Uigh"]),
          getFont(["font", "Sylfaen", "Geor"]),
          getFont(["font", "Arial", "Armn"]),
          getFont(["font", "Leelawadee UI", "Bugi"]),
          getFont(["font", "Microsoft JhengHei", "Bopo"]),
          getFont(["font", "Javanese Text", "Java"]),
          getFont(["font", "Segoe UI", "Lisu"]),
          getFont(["font", "Myanmar Text", "Mymr"]),
          getFont(["font", "Ebrima", "Nkoo"]),
          getFont(["font", "Nirmala UI", "Olck"]),
          getFont(["font", "Ebrima", "Osma"]),
          getFont(["font", "Phagspa", "Phag"]),
          getFont(["font", "Estrangelo Edessa", "Syrn"]),
          getFont(["font", "Estrangelo Edessa", "Syrj"]),
          getFont(["font", "Estrangelo Edessa", "Syre"]),
          getFont(["font", "Nirmala UI", "Sora"]),
          getFont(["font", "Microsoft Tai Le", "Tale"]),
          getFont(["font", "Microsoft New Tai Lue", "Talu"]),
          getFont(["font", "Ebrima", "Tfng"])
        ]
      }, {
        name: "a:minorFont",
        children: [
          getFont(["latin", "Calibri", void 0, "020F0502020204030204"]),
          getFont(["ea", ""]),
          getFont(["cs", ""]),
          getFont(["font", "\u6E38\u30B4\u30B7\u30C3\u30AF", "Jpan"]),
          getFont(["font", "\uB9D1\uC740 \uACE0\uB515", "Hang"]),
          getFont(["font", "\u7B49\u7EBF", "Hans"]),
          getFont(["font", "\u65B0\u7D30\u660E\u9AD4", "Hant"]),
          getFont(["font", "Arial", "Arab"]),
          getFont(["font", "Arial", "Hebr"]),
          getFont(["font", "Tahoma", "Thai"]),
          getFont(["font", "Nyala", "Ethi"]),
          getFont(["font", "Vrinda", "Beng"]),
          getFont(["font", "Shruti", "Gujr"]),
          getFont(["font", "DaunPenh", "Khmr"]),
          getFont(["font", "Tunga", "Knda"]),
          getFont(["font", "Raavi", "Guru"]),
          getFont(["font", "Euphemia", "Cans"]),
          getFont(["font", "Plantagenet Cherokee", "Cher"]),
          getFont(["font", "Microsoft Yi Baiti", "Yiii"]),
          getFont(["font", "Microsoft Himalaya", "Tibt"]),
          getFont(["font", "MV Boli", "Thaa"]),
          getFont(["font", "Mangal", "Deva"]),
          getFont(["font", "Gautami", "Telu"]),
          getFont(["font", "Latha", "Taml"]),
          getFont(["font", "Estrangelo Edessa", "Syrc"]),
          getFont(["font", "Kalinga", "Orya"]),
          getFont(["font", "Kartika", "Mlym"]),
          getFont(["font", "DokChampa", "Laoo"]),
          getFont(["font", "Iskoola Pota", "Sinh"]),
          getFont(["font", "Mongolian Baiti", "Mong"]),
          getFont(["font", "Arial", "Viet"]),
          getFont(["font", "Microsoft Uighur", "Uigh"]),
          getFont(["font", "Sylfaen", "Geor"]),
          getFont(["font", "Arial", "Armn"]),
          getFont(["font", "Leelawadee UI", "Bugi"]),
          getFont(["font", "Microsoft JhengHei", "Bopo"]),
          getFont(["font", "Javanese Text", "Java"]),
          getFont(["font", "Segoe UI", "Lisu"]),
          getFont(["font", "Myanmar Text", "Mymr"]),
          getFont(["font", "Ebrima", "Nkoo"]),
          getFont(["font", "Nirmala UI", "Olck"]),
          getFont(["font", "Ebrima", "Osma"]),
          getFont(["font", "Phagspa", "Phag"]),
          getFont(["font", "Estrangelo Edessa", "Syrn"]),
          getFont(["font", "Estrangelo Edessa", "Syrj"]),
          getFont(["font", "Estrangelo Edessa", "Syre"]),
          getFont(["font", "Nirmala UI", "Sora"]),
          getFont(["font", "Microsoft Tai Le", "Tale"]),
          getFont(["font", "Microsoft New Tai Lue", "Talu"]),
          getFont(["font", "Ebrima", "Tfng"])
        ]
      }]
    };
  }
};
var fontScheme_default = fontScheme;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/themes/office/formatScheme.ts
var getPropertyVal = (name, val, children) => ({
  name: `a:${name}`,
  properties: {
    rawMap: {
      val
    }
  },
  children
});
var getGs = (props) => {
  const [pos, schemeColor, satMod, lumMod, tint, shade] = props;
  const children = [];
  children.push(getPropertyVal("satMod", satMod));
  if (lumMod) {
    children.push(getPropertyVal("lumMod", lumMod));
  }
  if (tint) {
    children.push(getPropertyVal("tint", tint));
  }
  if (shade) {
    children.push(getPropertyVal("shade", shade));
  }
  return {
    name: "a:gs",
    properties: {
      rawMap: {
        pos
      }
    },
    children: [{
      name: "a:schemeClr",
      properties: {
        rawMap: {
          val: schemeColor
        }
      },
      children
    }]
  };
};
var getSolidFill = (val, children) => ({
  name: "a:solidFill",
  children: [getPropertyVal("schemeClr", val, children)]
});
var getGradFill = (props) => {
  const [rotWithShape, gs1, gs2, gs3, lin] = props;
  const [ang, scaled] = lin;
  return {
    name: "a:gradFill",
    properties: {
      rawMap: {
        rotWithShape
      }
    },
    children: [{
      name: "a:gsLst",
      children: [
        getGs(gs1),
        getGs(gs2),
        getGs(gs3)
      ]
    }, {
      name: "a:lin",
      properties: {
        rawMap: {
          ang,
          scaled
        }
      }
    }]
  };
};
var getLine = (props) => {
  const [w, cap, cmpd, algn] = props;
  return {
    name: "a:ln",
    properties: {
      rawMap: { w, cap, cmpd, algn }
    },
    children: [
      getSolidFill("phClr"),
      getPropertyVal("prstDash", "solid"),
      {
        name: "a:miter",
        properties: {
          rawMap: {
            lim: "800000"
          }
        }
      }
    ]
  };
};
var getEffectStyle = (shadow) => {
  const children = [];
  if (shadow) {
    const [blurRad, dist, dir, algn, rotWithShape] = shadow;
    children.push({
      name: "a:outerShdw",
      properties: {
        rawMap: { blurRad, dist, dir, algn, rotWithShape }
      },
      children: [
        getPropertyVal("srgbClr", "000000", [getPropertyVal("alpha", "63000")])
      ]
    });
  }
  return {
    name: "a:effectStyle",
    children: [Object.assign({}, {
      name: "a:effectLst"
    }, children.length ? { children } : {})]
  };
};
var getFillStyleList = () => ({
  name: "a:fillStyleLst",
  children: [
    getSolidFill("phClr"),
    getGradFill([
      "1",
      ["0", "phClr", "105000", "110000", "67000"],
      ["50000", "phClr", "103000", "105000", "73000"],
      ["100000", "phClr", "109000", "105000", "81000"],
      ["5400000", "0"]
    ]),
    getGradFill([
      "1",
      ["0", "phClr", "103000", "102000", "94000"],
      ["50000", "phClr", "110000", "100000", void 0, "100000"],
      ["100000", "phClr", "120000", "99000", void 0, "78000"],
      ["5400000", "0"]
    ])
  ]
});
var getLineStyleList = () => ({
  name: "a:lnStyleLst",
  children: [
    getLine(["6350", "flat", "sng", "ctr"]),
    getLine(["12700", "flat", "sng", "ctr"]),
    getLine(["19050", "flat", "sng", "ctr"])
  ]
});
var getEffectStyleList = () => ({
  name: "a:effectStyleLst",
  children: [
    getEffectStyle(),
    getEffectStyle(),
    getEffectStyle(["57150", "19050", "5400000", "ctr", "0"])
  ]
});
var getBgFillStyleList = () => ({
  name: "a:bgFillStyleLst",
  children: [
    getSolidFill("phClr"),
    getSolidFill("phClr", [
      getPropertyVal("tint", "95000"),
      getPropertyVal("satMod", "170000")
    ]),
    getGradFill([
      "1",
      ["0", "phClr", "150000", "102000", "93000", "98000"],
      ["50000", "phClr", "130000", "103000", "98000", "90000"],
      ["100000", "phClr", "120000", void 0, void 0, "63000"],
      ["5400000", "0"]
    ])
  ]
});
var formatScheme = {
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
var formatScheme_default = formatScheme;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/themes/office/themeElements.ts
var themeElements = {
  getTemplate() {
    return {
      name: "a:themeElements",
      children: [
        colorScheme_default.getTemplate(),
        fontScheme_default.getTemplate(),
        formatScheme_default.getTemplate()
      ]
    };
  }
};
var themeElements_default = themeElements;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/themes/office.ts
var officeTheme = {
  getTemplate() {
    return {
      name: "a:theme",
      properties: {
        prefixedAttributes: [{
          prefix: "xmlns:",
          map: {
            a: "http://schemas.openxmlformats.org/drawingml/2006/main"
          }
        }],
        rawMap: {
          name: "Office Theme"
        }
      },
      children: [
        themeElements_default.getTemplate(),
        {
          name: "a:objectDefaults"
        },
        {
          name: "a:extraClrSchemeLst"
        }
      ]
    };
  }
};
var office_default = officeTheme;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/sharedStrings.ts
var import_core = require("@ag-grid-community/core");
var buildSharedString = (strMap) => {
  const ret = [];
  for (const key of strMap.keys()) {
    const textNode = key.toString();
    const child = {
      name: "t",
      textNode: import_core._.escapeString(textNode)
    };
    const preserveSpaces = textNode.trim().length !== textNode.length;
    if (preserveSpaces) {
      child.properties = {
        rawMap: {
          "xml:space": "preserve"
        }
      };
    }
    ret.push({
      name: "si",
      children: [child]
    });
  }
  return ret;
};
var sharedStrings = {
  getTemplate(strings) {
    return {
      name: "sst",
      properties: {
        rawMap: {
          xmlns: "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
          count: strings.size,
          uniqueCount: strings.size
        }
      },
      children: buildSharedString(strings)
    };
  }
};
var sharedStrings_default = sharedStrings;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/numberFormat.ts
var import_core2 = require("@ag-grid-community/core");
function prepareString(str) {
  const split = str.split(/(\[[^\]]*\])/);
  for (let i = 0; i < split.length; i++) {
    let currentString = split[i];
    if (!currentString.length) {
      continue;
    }
    if (!currentString.startsWith("[")) {
      currentString = currentString.replace(/\$/g, '"$"');
    }
    split[i] = import_core2._.escapeString(currentString);
  }
  return split.join("");
}
var numberFormatFactory = {
  getTemplate(numberFormat) {
    let { formatCode, numFmtId } = numberFormat;
    if (formatCode.length) {
      formatCode = prepareString(formatCode);
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
var numberFormat_default = numberFormatFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/numberFormats.ts
var numberFormatsFactory = {
  getTemplate(numberFormats) {
    return {
      name: "numFmts",
      properties: {
        rawMap: {
          count: numberFormats.length
        }
      },
      children: numberFormats.map((numberFormat) => numberFormat_default.getTemplate(numberFormat))
    };
  }
};
var numberFormats_default = numberFormatsFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/font.ts
var fontFactory = {
  getTemplate(font) {
    const {
      size,
      colorTheme,
      color = "FF000000",
      fontName = "Calibri",
      family,
      scheme,
      italic,
      bold,
      strikeThrough,
      outline,
      shadow,
      underline,
      verticalAlign
    } = font;
    const children = [
      { name: "sz", properties: { rawMap: { val: size } } },
      { name: "color", properties: { rawMap: { theme: colorTheme, rgb: color } } },
      { name: "name", properties: { rawMap: { val: fontName } } }
    ];
    if (family) {
      children.push({ name: "family", properties: { rawMap: { val: family } } });
    }
    if (scheme) {
      children.push({ name: "scheme", properties: { rawMap: { val: scheme } } });
    }
    if (italic) {
      children.push({ name: "i" });
    }
    if (bold) {
      children.push({ name: "b" });
    }
    if (strikeThrough) {
      children.push({ name: "strike" });
    }
    if (outline) {
      children.push({ name: "outline" });
    }
    if (shadow) {
      children.push({ name: "shadow" });
    }
    if (underline) {
      children.push({ name: "u", properties: { rawMap: { val: underline } } });
    }
    if (verticalAlign) {
      children.push({ name: "vertAlign", properties: { rawMap: { val: verticalAlign } } });
    }
    return { name: "font", children };
  }
};
var font_default = fontFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/fonts.ts
var fontsFactory = {
  getTemplate(fonts) {
    return {
      name: "fonts",
      properties: {
        rawMap: {
          count: fonts.length
        }
      },
      children: fonts.map((font) => font_default.getTemplate(font))
    };
  }
};
var fonts_default = fontsFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/fill.ts
var fillFactory = {
  getTemplate(fill) {
    const { patternType, fgTheme, fgTint, fgRgb, bgRgb, bgIndexed } = fill;
    const pf = {
      name: "patternFill",
      properties: {
        rawMap: {
          patternType
        }
      }
    };
    if (fgTheme || fgTint || fgRgb) {
      pf.children = [{
        name: "fgColor",
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
        name: "bgColor",
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
var fill_default = fillFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/fills.ts
var fillsFactory = {
  getTemplate(fills) {
    return {
      name: "fills",
      properties: {
        rawMap: {
          count: fills.length
        }
      },
      children: fills.map((fill) => fill_default.getTemplate(fill))
    };
  }
};
var fills_default = fillsFactory;

// enterprise-modules/excel-export/src/excelExport/assets/excelLegacyConvert.ts
var getWeightName = (value) => {
  switch (value) {
    case 1:
      return "thin";
    case 2:
      return "medium";
    case 3:
      return "thick";
    default:
      return "hair";
  }
};
var mappedBorderNames = {
  None: "None",
  Dot: "Dotted",
  Dash: "Dashed",
  Double: "Double",
  DashDot: "DashDot",
  DashDotDot: "DashDotDot",
  SlantDashDot: "SlantDashDot"
};
var mediumBorders = ["Dashed", "DashDot", "DashDotDot"];
var colorMap = {
  None: "none",
  Solid: "solid",
  Gray50: "mediumGray",
  Gray75: "darkGray",
  Gray25: "lightGray",
  HorzStripe: "darkHorizontal",
  VertStripe: "darkVertical",
  ReverseDiagStripe: "darkDown",
  DiagStripe: "darkUp",
  DiagCross: "darkGrid",
  ThickDiagCross: "darkTrellis",
  ThinHorzStripe: "lightHorizontal",
  ThinVertStripe: "lightVertical",
  ThinReverseDiagStripe: "lightDown",
  ThinDiagStripe: "lightUp",
  ThinHorzCross: "lightGrid",
  ThinDiagCross: "lightTrellis",
  Gray125: "gray125",
  Gray0625: "gray0625"
};
var horizontalAlignmentMap = {
  Automatic: "general",
  Left: "left",
  Center: "center",
  Right: "right",
  Fill: "fill",
  Justify: "justify",
  CenterAcrossSelection: "centerContinuous",
  Distributed: "distributed",
  JustifyDistributed: "justify"
};
var verticalAlignmentMap = {
  Automatic: void 0,
  Top: "top",
  Bottom: "bottom",
  Center: "center",
  Justify: "justify",
  Distributed: "distributed",
  JustifyDistributed: "justify"
};
var convertLegacyPattern = (name) => {
  if (!name) {
    return "none";
  }
  return colorMap[name] || name;
};
var convertLegacyColor = (color) => {
  if (color == void 0) {
    return color;
  }
  if (color.charAt(0) === "#") {
    color = color.substring(1);
  }
  return color.length === 6 ? "FF" + color : color;
};
var convertLegacyBorder = (type, weight) => {
  if (!type) {
    return "thin";
  }
  const namedWeight = getWeightName(weight);
  const mappedName = mappedBorderNames[type];
  if (type === "Continuous") {
    return namedWeight;
  }
  if (namedWeight === "medium" && mediumBorders.indexOf(mappedName) !== -1) {
    return `medium${mappedName}`;
  }
  return mappedName.charAt(0).toLowerCase() + mappedName.substring(1);
};
var convertLegacyHorizontalAlignment = (alignment) => {
  return horizontalAlignmentMap[alignment] || "general";
};
var convertLegacyVerticalAlignment = (alignment) => {
  return verticalAlignmentMap[alignment] || void 0;
};

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/border.ts
var getBorderColor = (color) => {
  return {
    name: "color",
    properties: {
      rawMap: {
        rgb: convertLegacyColor(color || "#000000")
      }
    }
  };
};
var borderFactory = {
  getTemplate(border) {
    const { left, right, top, bottom, diagonal } = border;
    const leftChildren = left ? [getBorderColor(left.color)] : void 0;
    const rightChildren = right ? [getBorderColor(right.color)] : void 0;
    const topChildren = top ? [getBorderColor(top.color)] : void 0;
    const bottomChildren = bottom ? [getBorderColor(bottom.color)] : void 0;
    const diagonalChildren = diagonal ? [getBorderColor(diagonal.color)] : void 0;
    return {
      name: "border",
      children: [{
        name: "left",
        properties: { rawMap: { style: left && left.style } },
        children: leftChildren
      }, {
        name: "right",
        properties: { rawMap: { style: right && right.style } },
        children: rightChildren
      }, {
        name: "top",
        properties: { rawMap: { style: top && top.style } },
        children: topChildren
      }, {
        name: "bottom",
        properties: { rawMap: { style: bottom && bottom.style } },
        children: bottomChildren
      }, {
        name: "diagonal",
        properties: { rawMap: { style: diagonal && diagonal.style } },
        children: diagonalChildren
      }]
    };
  }
};
var border_default = borderFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/borders.ts
var bordersFactory = {
  getTemplate(borders) {
    return {
      name: "borders",
      properties: {
        rawMap: {
          count: borders.length
        }
      },
      children: borders.map((border) => border_default.getTemplate(border))
    };
  }
};
var borders_default = bordersFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/alignment.ts
var getReadingOrderId = (readingOrder) => {
  const order = ["Context", "LeftToRight", "RightToLeft"];
  const pos = order.indexOf(readingOrder);
  return Math.max(pos, 0);
};
var alignmentFactory = {
  getTemplate(alignment) {
    const { horizontal, indent, readingOrder, rotate, shrinkToFit, vertical, wrapText } = alignment;
    return {
      name: "alignment",
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
var alignment_default = alignmentFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/protection.ts
var protectionFactory = {
  getTemplate(protection) {
    const locked = protection.protected === false ? 0 : 1;
    const hidden = protection.hideFormula === true ? 1 : 0;
    return {
      name: "protection",
      properties: {
        rawMap: {
          hidden,
          locked
        }
      }
    };
  }
};
var protection_default = protectionFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/xf.ts
var xfFactory = {
  getTemplate(xf) {
    const { alignment, borderId, fillId, fontId, numFmtId, protection, quotePrefix, xfId } = xf;
    const children = [];
    if (alignment) {
      children.push(alignment_default.getTemplate(alignment));
    }
    if (protection) {
      children.push(protection_default.getTemplate(protection));
    }
    return {
      name: "xf",
      properties: {
        rawMap: {
          applyAlignment: alignment ? 1 : void 0,
          applyProtection: protection ? 1 : void 0,
          applyBorder: borderId ? 1 : void 0,
          applyFill: fillId ? 1 : void 0,
          borderId,
          fillId,
          applyFont: fontId ? 1 : void 0,
          fontId,
          applyNumberFormat: numFmtId ? 1 : void 0,
          numFmtId,
          quotePrefix: quotePrefix ? 1 : void 0,
          xfId
        }
      },
      children: children.length ? children : void 0
    };
  }
};
var xf_default = xfFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/cellStyleXfs.ts
var cellStylesXfsFactory = {
  getTemplate(xfs) {
    return {
      name: "cellStyleXfs",
      properties: {
        rawMap: {
          count: xfs.length
        }
      },
      children: xfs.map((xf) => xf_default.getTemplate(xf))
    };
  }
};
var cellStyleXfs_default = cellStylesXfsFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/cellXfs.ts
var cellXfsFactory = {
  getTemplate(xfs) {
    return {
      name: "cellXfs",
      properties: {
        rawMap: {
          count: xfs.length
        }
      },
      children: xfs.map((xf) => xf_default.getTemplate(xf))
    };
  }
};
var cellXfs_default = cellXfsFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/cellStyle.ts
var borderFactory2 = {
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
var cellStyle_default = borderFactory2;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/cellStyles.ts
var cellStylesFactory = {
  getTemplate(cellStyles) {
    return {
      name: "cellStyles",
      properties: {
        rawMap: {
          count: cellStyles.length
        }
      },
      children: cellStyles.map((cellStyle) => cellStyle_default.getTemplate(cellStyle))
    };
  }
};
var cellStyles_default = cellStylesFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/styles/stylesheet.ts
var stylesMap;
var registeredNumberFmts;
var registeredFonts;
var registeredFills;
var registeredBorders;
var registeredCellStyleXfs;
var registeredCellXfs;
var registeredCellStyles;
var currentSheet;
var getStyleName = (name, currentSheet2) => {
  if (name.indexOf("mixedStyle") !== -1 && currentSheet2 > 1) {
    name += `_${currentSheet2}`;
  }
  return name;
};
var resetStylesheetValues = () => {
  stylesMap = { base: 0 };
  registeredNumberFmts = [];
  registeredFonts = [{ fontName: "Calibri", colorTheme: "1", family: "2", scheme: "minor" }];
  registeredFills = [{ patternType: "none" }, { patternType: "gray125" }];
  registeredBorders = [{ left: void 0, right: void 0, top: void 0, bottom: void 0, diagonal: void 0 }];
  registeredCellStyleXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0 }];
  registeredCellXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0, xfId: 0 }];
  registeredCellStyles = [{ builtinId: 0, name: "Normal", xfId: 0 }];
};
var registerFill = (fill) => {
  const convertedPattern = convertLegacyPattern(fill.pattern);
  const convertedFillColor = convertLegacyColor(fill.color);
  const convertedPatternColor = convertLegacyColor(fill.patternColor);
  let pos = registeredFills.findIndex((currentFill) => {
    const { patternType, fgRgb, bgRgb } = currentFill;
    if (patternType != convertedPattern || fgRgb != convertedFillColor || bgRgb != convertedPatternColor) {
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
var registerNumberFmt = (format) => {
  if (numberFormatMap[format]) {
    return numberFormatMap[format];
  }
  let pos = registeredNumberFmts.findIndex((currentFormat) => currentFormat.formatCode === format);
  if (pos === -1) {
    pos = registeredNumberFmts.length + 164;
    registeredNumberFmts.push({ formatCode: format, numFmtId: pos });
  } else {
    pos = registeredNumberFmts[pos].numFmtId;
  }
  return pos;
};
var registerBorders = (borders) => {
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
  let pos = registeredBorders.findIndex((currentBorder) => {
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
        style: leftStyle,
        color: leftColor
      },
      right: {
        style: rightStyle,
        color: rightColor
      },
      top: {
        style: topStyle,
        color: topColor
      },
      bottom: {
        style: bottomStyle,
        color: bottomColor
      },
      diagonal: {
        style: void 0,
        color: void 0
      }
    });
  }
  return pos;
};
var registerFont = (font) => {
  const { fontName: name = "Calibri", color, size, bold, italic, outline, shadow, strikeThrough, underline, family, verticalAlign } = font;
  const convertedColor = convertLegacyColor(color);
  const familyId = getFontFamilyId(family);
  const convertedUnderline = underline ? underline.toLocaleLowerCase() : void 0;
  const convertedVerticalAlign = verticalAlign ? verticalAlign.toLocaleLowerCase() : void 0;
  let pos = registeredFonts.findIndex((currentFont) => {
    if (currentFont.fontName != name || currentFont.color != convertedColor || currentFont.size != size || currentFont.bold != bold || currentFont.italic != italic || currentFont.outline != outline || currentFont.shadow != shadow || currentFont.strikeThrough != strikeThrough || currentFont.underline != convertedUnderline || currentFont.verticalAlign != convertedVerticalAlign || // @ts-ignore
    currentFont.family != familyId) {
      return false;
    }
    return true;
  });
  if (pos === -1) {
    pos = registeredFonts.length;
    registeredFonts.push({
      fontName: name,
      color: convertedColor,
      size,
      bold,
      italic,
      outline,
      shadow,
      strikeThrough,
      underline: convertedUnderline,
      verticalAlign: convertedVerticalAlign,
      family: familyId != null ? familyId.toString() : void 0
    });
  }
  return pos;
};
var registerStyle = (config) => {
  const { alignment, borders, font, interior, numberFormat, protection, quotePrefix } = config;
  let { id } = config;
  let currentFill = 0;
  let currentBorder = 0;
  let currentFont = 0;
  let currentNumberFmt = 0;
  if (!id) {
    return;
  }
  id = getStyleName(id, currentSheet);
  if (stylesMap[id] != void 0) {
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
    quotePrefix,
    xfId: 0
  });
};
var stylesheetFactory = {
  getTemplate(defaultFontSize) {
    const numberFormats = numberFormats_default.getTemplate(registeredNumberFmts);
    const fonts = fonts_default.getTemplate(registeredFonts.map((font) => __spreadProps(__spreadValues({}, font), { size: font.size != null ? font.size : defaultFontSize })));
    const fills = fills_default.getTemplate(registeredFills);
    const borders = borders_default.getTemplate(registeredBorders);
    const cellStylesXfs = cellStyleXfs_default.getTemplate(registeredCellStyleXfs);
    const cellXfs = cellXfs_default.getTemplate(registeredCellXfs);
    const cellStyles = cellStyles_default.getTemplate(registeredCellStyles);
    resetStylesheetValues();
    return {
      name: "styleSheet",
      properties: {
        rawMap: {
          "mc:Ignorable": "x14ac x16r2 xr",
          "xmlns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
          "xmlns:mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
          "xmlns:x14ac": "http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac",
          "xmlns:x16r2": "http://schemas.microsoft.com/office/spreadsheetml/2015/02/main",
          "xmlns:xr": "http://schemas.microsoft.com/office/spreadsheetml/2014/revision"
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
          name: "tableStyles",
          properties: {
            rawMap: {
              count: 0,
              defaultPivotStyle: "PivotStyleLight16",
              defaultTableStyle: "TableStyleMedium2"
            }
          }
        }
      ]
    };
  }
};
var getStyleId = (name, currentSheet2) => {
  return stylesMap[getStyleName(name, currentSheet2)] || 0;
};
var registerStyles = (styles, _currentSheet) => {
  currentSheet = _currentSheet;
  if (currentSheet === 1) {
    resetStylesheetValues();
  }
  styles.forEach(registerStyle);
};
var stylesheet_default = stylesheetFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/sheet.ts
var sheetFactory = {
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
var sheet_default = sheetFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/sheets.ts
var sheetsFactory = {
  getTemplate(names) {
    return {
      name: "sheets",
      children: names.map((sheet, idx) => sheet_default.getTemplate(sheet, idx))
    };
  }
};
var sheets_default = sheetsFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/workbook.ts
var workbookFactory = {
  getTemplate(names) {
    return {
      name: "workbook",
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
      children: [sheets_default.getTemplate(names)]
    };
  }
};
var workbook_default = workbookFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/worksheet.ts
var import_core4 = require("@ag-grid-community/core");

// enterprise-modules/excel-export/src/excelExport/files/ooxml/column.ts
var getExcelCellWidth = (width) => Math.ceil((width - 12) / 7 + 1);
var columnFactory = {
  getTemplate(config) {
    const { min, max, outlineLevel, s, width, hidden, bestFit } = config;
    let excelWidth = 1;
    let customWidth = "0";
    if (width > 1) {
      excelWidth = getExcelCellWidth(width);
      customWidth = "1";
    }
    return {
      name: "col",
      properties: {
        rawMap: {
          min,
          max,
          outlineLevel: outlineLevel != null ? outlineLevel : void 0,
          width: excelWidth,
          style: s,
          hidden: hidden ? "1" : "0",
          bestFit: bestFit ? "1" : "0",
          customWidth
        }
      }
    };
  }
};
var column_default = columnFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/cell.ts
var import_core3 = require("@ag-grid-community/core");
var convertLegacyType = (type) => {
  const t = type.charAt(0).toLowerCase();
  return t === "s" ? "inlineStr" : t;
};
var cellFactory = {
  getTemplate(config, idx, currentSheet2) {
    const { ref, data, styleId } = config;
    const { type, value } = data || { type: "empty", value: null };
    let convertedType = type;
    if (type === "f") {
      convertedType = "str";
    } else if (type.charAt(0) === type.charAt(0).toUpperCase()) {
      convertedType = convertLegacyType(type);
    }
    const obj = {
      name: "c",
      properties: {
        rawMap: {
          r: ref,
          t: convertedType === "empty" ? void 0 : convertedType,
          s: styleId ? getStyleId(styleId, currentSheet2) : void 0
        }
      }
    };
    if (convertedType === "empty") {
      return obj;
    }
    let children;
    if (convertedType === "str" && type === "f") {
      children = [{
        name: "f",
        textNode: import_core3._.escapeString(value)
      }];
    } else if (convertedType === "inlineStr") {
      children = [{
        name: "is",
        children: [{
          name: "t",
          textNode: import_core3._.escapeString(value)
        }]
      }];
    } else {
      children = [{
        name: "v",
        textNode: value
      }];
    }
    return Object.assign({}, obj, { children });
  }
};
var cell_default = cellFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/row.ts
var addEmptyCells = (cells, rowIdx) => {
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
          data: { type: "empty", value: null }
        });
      }
      if (mergedCells.length) {
        cells.splice(mergeMap[i].pos + 1, 0, ...mergedCells);
      }
    }
  }
};
var shouldDisplayCell = (cell) => {
  var _a;
  return ((_a = cell.data) == null ? void 0 : _a.value) !== "" || cell.styleId !== void 0;
};
var rowFactory = {
  getTemplate(config, idx, currentSheet2) {
    const { collapsed, hidden, height, outlineLevel, cells = [] } = config;
    addEmptyCells(cells, idx);
    const children = cells.filter(shouldDisplayCell).map((cell, idx2) => cell_default.getTemplate(cell, idx2, currentSheet2));
    return {
      name: "row",
      properties: {
        rawMap: {
          r: idx + 1,
          collapsed: collapsed ? "1" : "0",
          hidden: hidden ? "1" : "0",
          ht: height,
          customHeight: height != null ? "1" : "0",
          spans: "1:1",
          outlineLevel: outlineLevel || void 0
        }
      },
      children
    };
  }
};
var row_default = rowFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/mergeCell.ts
var mergeCellFactory = {
  getTemplate(ref) {
    return {
      name: "mergeCell",
      properties: {
        rawMap: {
          ref
        }
      }
    };
  }
};
var mergeCell_default = mergeCellFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/worksheet.ts
var getMergedCellsAndAddColumnGroups = (rows, cols, suppressColumnOutline) => {
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
        collapsibleRanges.forEach((range) => {
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
  const rangeMap = /* @__PURE__ */ new Map();
  const outlineLevel = /* @__PURE__ */ new Map();
  cellsWithCollapsibleGroups.filter((currentRange) => {
    const rangeString = currentRange.toString();
    const inMap = rangeMap.get(rangeString);
    if (inMap) {
      return false;
    }
    rangeMap.set(rangeString, true);
    return true;
  }).forEach((range) => {
    const refCol = cols.find((col) => col.min == range[0] && col.max == range[1]);
    const currentOutlineLevel = outlineLevel.get(range[0]);
    cols.push({
      min: range[0],
      max: range[1],
      outlineLevel: suppressColumnOutline ? void 0 : currentOutlineLevel || 1,
      width: (refCol || { width: 100 }).width
    });
    outlineLevel.set(range[0], (currentOutlineLevel || 0) + 1);
  });
  return mergedCells;
};
var getPageOrientation = (orientation) => {
  if (!orientation || orientation !== "Portrait" && orientation !== "Landscape") {
    return "portrait";
  }
  return orientation.toLocaleLowerCase();
};
var getPageSize = (pageSize) => {
  if (pageSize == null) {
    return 1;
  }
  const positions = ["Letter", "Letter Small", "Tabloid", "Ledger", "Legal", "Statement", "Executive", "A3", "A4", "A4 Small", "A5", "A6", "B4", "B5", "Folio", "Envelope", "Envelope DL", "Envelope C5", "Envelope B5", "Envelope C3", "Envelope C4", "Envelope C6", "Envelope Monarch", "Japanese Postcard", "Japanese Double Postcard"];
  const pos = positions.indexOf(pageSize);
  return pos === -1 ? 1 : pos + 1;
};
var addColumns = (columns) => {
  return (params) => {
    if (columns.length) {
      params.children.push({
        name: "cols",
        children: columns.map((column) => column_default.getTemplate(column))
      });
    }
    return params;
  };
};
var addSheetData = (rows, sheetNumber) => {
  return (params) => {
    if (rows.length) {
      params.children.push({
        name: "sheetData",
        children: rows.map((row, idx) => row_default.getTemplate(row, idx, sheetNumber))
      });
    }
    return params;
  };
};
var addMergeCells = (mergeCells) => {
  return (params) => {
    if (mergeCells.length) {
      params.children.push({
        name: "mergeCells",
        properties: {
          rawMap: {
            count: mergeCells.length
          }
        },
        children: mergeCells.map((mergedCell) => mergeCell_default.getTemplate(mergedCell))
      });
    }
    return params;
  };
};
var addPageMargins = (margins) => {
  return (params) => {
    const { top = 0.75, right = 0.7, bottom = 0.75, left = 0.7, header = 0.3, footer = 0.3 } = margins;
    params.children.push({
      name: "pageMargins",
      properties: {
        rawMap: { bottom, footer, header, left, right, top }
      }
    });
    return params;
  };
};
var addPageSetup = (pageSetup) => {
  return (params) => {
    if (pageSetup) {
      params.children.push({
        name: "pageSetup",
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
    return params;
  };
};
var replaceHeaderFooterTokens = (value) => {
  const map = {
    "&[Page]": "&P",
    "&[Pages]": "&N",
    "&[Date]": "&D",
    "&[Time]": "&T",
    "&[Tab]": "&A",
    "&[Path]": "&Z",
    "&[File]": "&F",
    "&[Picture]": "&G"
  };
  import_core4._.iterateObject(map, (key, val) => {
    value = value.replace(key, val);
  });
  return value;
};
var getHeaderPosition = (position) => {
  if (position === "Center") {
    return "C";
  }
  if (position === "Right") {
    return "R";
  }
  return "L";
};
var applyHeaderFontStyle = (headerString, font) => {
  if (!font) {
    return headerString;
  }
  headerString += "&amp;&quot;";
  headerString += font.fontName || "Calibri";
  if (font.bold !== font.italic) {
    headerString += font.bold ? ",Bold" : ",Italic";
  } else if (font.bold) {
    headerString += ",Bold Italic";
  } else {
    headerString += ",Regular";
  }
  headerString += "&quot;";
  if (font.size) {
    headerString += `&amp;${font.size}`;
  }
  if (font.strikeThrough) {
    headerString += "&amp;S";
  }
  if (font.underline) {
    headerString += `&amp;${font.underline === "Double" ? "E" : "U"}`;
  }
  if (font.color) {
    headerString += `&amp;K${font.color.replace("#", "").toUpperCase()}`;
  }
  return headerString;
};
var processHeaderFooterContent = (content, location, rule) => content.reduce((prev, curr, idx) => {
  const pos = getHeaderPosition(curr.position);
  const output = applyHeaderFontStyle(`${prev}&amp;${pos}`, curr.font);
  const PositionMap = ["Left", "Center", "Right"];
  if (!curr.position) {
    curr.position = PositionMap[idx];
  }
  const { image } = curr;
  if (curr.value === "&[Picture]" && image) {
    const imagePosition = `${pos}${location}${rule}`;
    ExcelXlsxFactory.addHeaderFooterImageToMap(image, imagePosition);
  }
  return `${output}${import_core4._.escapeString(replaceHeaderFooterTokens(curr.value))}`;
}, "");
var buildHeaderFooter = (headerFooterConfig) => {
  const rules = ["all", "first", "even"];
  const headersAndFooters = [];
  rules.forEach((rule) => {
    const headerFooter = headerFooterConfig[rule];
    const namePrefix = rule === "all" ? "odd" : rule;
    if (!headerFooter) {
      return;
    }
    for (const [key, value] of Object.entries(headerFooter)) {
      const nameSuffix = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      const location = key[0].toUpperCase();
      if (value) {
        const normalizedRule = rule === "all" ? "" : rule.toUpperCase();
        headersAndFooters.push({
          name: `${namePrefix}${nameSuffix}`,
          properties: {
            rawMap: { "xml:space": "preserve" }
          },
          textNode: processHeaderFooterContent(value, location, normalizedRule)
        });
      }
    }
  });
  return headersAndFooters;
};
var addHeaderFooter = (headerFooterConfig) => {
  return (params) => {
    if (!headerFooterConfig) {
      return params;
    }
    const differentFirst = headerFooterConfig.first != null ? 1 : 0;
    const differentOddEven = headerFooterConfig.even != null ? 1 : 0;
    params.children.push({
      name: "headerFooter",
      properties: {
        rawMap: {
          differentFirst,
          differentOddEven
        }
      },
      children: buildHeaderFooter(headerFooterConfig)
    });
    return params;
  };
};
var addExcelTableRel = (excelTable) => {
  return (params) => {
    if (excelTable) {
      params.children.push({
        name: "tableParts",
        properties: {
          rawMap: {
            count: "1"
          }
        },
        children: [{
          name: "tablePart",
          properties: {
            rawMap: {
              "r:id": `rId${++params.rIdCounter}`
            }
          }
        }]
      });
    }
    return params;
  };
};
var addDrawingRel = (currentSheet2) => {
  return (params) => {
    const worksheetImages = ExcelXlsxFactory.worksheetImages.get(currentSheet2);
    if (worksheetImages == null ? void 0 : worksheetImages.length) {
      params.children.push({
        name: "drawing",
        properties: {
          rawMap: {
            "r:id": `rId${++params.rIdCounter}`
          }
        }
      });
    }
    return params;
  };
};
var addVmlDrawingRel = (currentSheet2) => {
  return (params) => {
    if (ExcelXlsxFactory.worksheetHeaderFooterImages.get(currentSheet2)) {
      params.children.push({
        name: "legacyDrawingHF",
        properties: {
          rawMap: {
            "r:id": `rId${++params.rIdCounter}`
          }
        }
      });
    }
    return params;
  };
};
var addSheetPr = () => {
  return (params) => {
    params.children.push({
      name: "sheetPr",
      children: [{
        name: "outlinePr",
        properties: {
          rawMap: {
            summaryBelow: 0
          }
        }
      }]
    });
    return params;
  };
};
var addSheetFormatPr = (rows) => {
  return (params) => {
    const maxOutline = rows.reduce((prev, row) => {
      if (row.outlineLevel && row.outlineLevel > prev) {
        return row.outlineLevel;
      }
      return prev;
    }, 0);
    params.children.push({
      name: "sheetFormatPr",
      properties: {
        rawMap: {
          baseColWidth: 10,
          defaultRowHeight: 16,
          outlineLevelRow: maxOutline ? maxOutline : void 0
        }
      }
    });
    return params;
  };
};
var worksheetFactory = {
  getTemplate(params) {
    const { worksheet, currentSheet: currentSheet2, config } = params;
    const { margins = {}, pageSetup, headerFooterConfig, suppressColumnOutline } = config;
    const { table } = worksheet;
    const { rows, columns } = table;
    const mergedCells = columns && columns.length ? getMergedCellsAndAddColumnGroups(rows, columns, !!suppressColumnOutline) : [];
    const { worksheetDataTables } = ExcelXlsxFactory;
    const worksheetExcelTables = worksheetDataTables.get(currentSheet2);
    const createWorksheetChildren = import_core4._.compose(
      addSheetPr(),
      addSheetFormatPr(rows),
      addColumns(columns),
      addSheetData(rows, currentSheet2 + 1),
      addMergeCells(mergedCells),
      addPageMargins(margins),
      addPageSetup(pageSetup),
      addHeaderFooter(headerFooterConfig),
      addDrawingRel(currentSheet2),
      addVmlDrawingRel(currentSheet2),
      addExcelTableRel(worksheetExcelTables)
    );
    const { children } = createWorksheetChildren({ children: [], rIdCounter: 0 });
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
var worksheet_default = worksheetFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/relationship.ts
var relationshipFactory = {
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
var relationship_default = relationshipFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/relationships.ts
var relationshipsFactory = {
  getTemplate(c) {
    const children = c.map((relationship) => relationship_default.getTemplate(relationship));
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
var relationships_default = relationshipsFactory;

// enterprise-modules/excel-export/src/excelExport/files/ooxml/vmlDrawing.ts
var getShapeLayout = () => ({
  name: "o:shapelayout",
  properties: {
    prefixedAttributes: [{
      prefix: "v:",
      map: {
        ext: "edit"
      }
    }]
  },
  children: [
    {
      name: "o:idmap",
      properties: {
        prefixedAttributes: [{
          prefix: "v:",
          map: {
            ext: "edit"
          }
        }],
        rawMap: {
          data: "1"
        }
      }
    }
  ]
});
var getStroke = () => ({
  name: "v:stroke",
  properties: {
    rawMap: {
      joinstyle: "miter"
    }
  }
});
var getFormulas = (formulas) => ({
  name: "v:formulas",
  children: formulas.map((formula) => ({
    name: "v:f",
    properties: {
      rawMap: {
        eqn: formula
      }
    }
  }))
});
var getPath = () => ({
  name: "v:path",
  properties: {
    prefixedAttributes: [{
      prefix: "o:",
      map: {
        connecttype: "rect",
        extrusionok: "f"
      }
    }],
    rawMap: {
      gradientshapeok: "t"
    }
  }
});
var getLock = (params) => {
  const { aspectratio, rotation } = params || {};
  const rawMap = {};
  if (aspectratio) {
    rawMap.aspectratio = "t";
  }
  if (rotation) {
    rawMap.rotation = "t";
  }
  return {
    name: "o:lock",
    properties: {
      prefixedAttributes: [{
        prefix: "v:",
        map: {
          ext: "edit"
        }
      }],
      rawMap
    }
  };
};
function mapNumber(value, startSource, endSource, startTarget, endTarget) {
  return (value - startSource) / (endSource - startSource) * (endTarget - startTarget) + startTarget;
}
var gainMap = {
  0: "0",
  5: "6554f",
  10: "13107f",
  15: "19661f",
  20: "26214f",
  25: ".5",
  30: "39322f",
  35: "45875f",
  40: "52429f",
  45: "58982f",
  50: "1",
  55: "72818f",
  60: "1.25",
  65: "93623f",
  70: "109227f",
  75: "2",
  80: "2.5",
  85: "3.4",
  90: "5",
  95: "10",
  96: "12.5",
  97: "1092267f",
  98: "25",
  99: "50",
  100: "2147483647f"
};
var getImageData = (image, idx) => {
  var _a;
  let rawMap;
  const { recolor, brightness, contrast, id } = image;
  if (recolor) {
    rawMap = {};
    if (recolor === "Washout" || recolor === "Grayscale") {
      rawMap.gain = "19661f";
      rawMap.blacklevel = "22938f";
    }
    if (recolor === "Black & White" || recolor === "Grayscale") {
      rawMap.grayscale = "t";
      if (recolor === "Black & White") {
        rawMap.bilevel = "t";
      }
    }
  }
  if (!recolor || recolor === "Grayscale") {
    if (!rawMap) {
      rawMap = {};
    }
    if (contrast != null && contrast !== 50) {
      rawMap.gain = (_a = gainMap[contrast]) != null ? _a : "1";
    }
    if (brightness != null && brightness !== 50) {
      rawMap.blacklevel = mapNumber(brightness, 0, 100, -0.5, 0.5).toString();
    }
  }
  return {
    name: "v:imagedata",
    properties: {
      prefixedAttributes: [{
        prefix: "o:",
        map: {
          relid: `rId${idx}`,
          title: id
        }
      }],
      rawMap
    }
  };
};
var getShapeType = () => {
  const formulas = [
    "if lineDrawn pixelLineWidth 0",
    "sum @0 1 0",
    "sum 0 0 @1",
    "prod @2 1 2",
    "prod @3 21600 pixelWidth",
    "prod @3 21600 pixelHeight",
    "sum @0 0 1",
    "prod @6 1 2",
    "prod @7 21600 pixelWidth",
    "sum @8 21600 0",
    "prod @7 21600 pixelHeight",
    "sum @10 21600 0"
  ];
  return {
    name: "v:shapetype",
    properties: {
      prefixedAttributes: [{
        prefix: "o:",
        map: {
          spt: "75",
          preferrelative: "t"
        }
      }],
      rawMap: {
        coordsize: "21600,21600",
        filled: "f",
        id: "_x0000_t75",
        path: "m@4@5l@4@11@9@11@9@5xe",
        stroked: "f"
      }
    },
    children: [
      getStroke(),
      getFormulas(formulas),
      getPath(),
      getLock({ aspectratio: true })
    ]
  };
};
var pixelToPoint = (value) => Math.floor((value != null ? value : 0) * 0.74999943307122);
var getShape = (image, idx) => {
  const { width = 0, height = 0, altText } = image;
  const imageWidth = pixelToPoint(width);
  const imageHeight = pixelToPoint(height);
  return {
    name: "v:shape",
    properties: {
      rawMap: {
        id: image.headerFooterPosition,
        "o:spid": "_x0000_s1025",
        style: `position: absolute; margin-left: 0; margin-top: 10in; margin-bottom: 0; margin-right: 0; width: ${imageWidth}pt; height: ${imageHeight}pt; z-index: ${idx + 1}`,
        type: "#_x0000_t75",
        alt: altText
      }
    },
    children: [
      getImageData(image, idx + 1),
      getLock({ rotation: true })
    ]
  };
};
var vmlDrawingFactory = {
  getTemplate(params) {
    const headerFooterImages = ExcelXlsxFactory.worksheetHeaderFooterImages.get(params.sheetIndex) || [];
    const children = [getShapeLayout(), getShapeType(), ...headerFooterImages.map((img, idx) => getShape(img, idx))];
    return {
      name: "xml",
      properties: {
        prefixedAttributes: [{
          prefix: "xmlns:",
          map: {
            v: "urn:schemas-microsoft-com:vml",
            o: "urn:schemas-microsoft-com:office:office",
            x: "urn:schemas-microsoft-com:office:excel"
          }
        }]
      },
      children
    };
  }
};
var vmlDrawing_default = vmlDrawingFactory;

// enterprise-modules/excel-export/src/excelExport/excelXlsxFactory.ts
var _ExcelXlsxFactory = class _ExcelXlsxFactory {
  static createExcel(styles, worksheet, config) {
    this.addSheetName(worksheet);
    registerStyles(styles, this.sheetNames.length);
    let newConfig = Object.assign({}, config);
    if (config.exportAsExcelTable) {
      if (config.columnModel.isPivotActive()) {
        this.showExcelTableNonCompatibleFeaturesWarning("pivot mode");
        newConfig.exportAsExcelTable = false;
      }
      if (config.gos.get("masterDetail")) {
        this.showExcelTableNonCompatibleFeaturesWarning("master/detail");
        newConfig.exportAsExcelTable = false;
      }
    }
    this.processTableConfig(worksheet, newConfig);
    return this.createWorksheet(worksheet, newConfig);
  }
  static showExcelTableNonCompatibleFeaturesWarning(featureName) {
    console.warn(
      `AG Grid: Excel table export does not work with ${featureName}. The exported Excel file will not contain any Excel tables.
Please turn off ${featureName} to enable Excel table exports.`
    );
  }
  static getTableNameFromIndex(idx) {
    return `table${idx + 1}`;
  }
  static getSanitizedTableName(name) {
    return name.replace(/^[^a-zA-Z_]+/, "_").replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g, "_");
  }
  static addTableToSheet(sheetIndex, table) {
    if (this.worksheetDataTables.has(sheetIndex)) {
      console.warn("Unable to add data table to Excel sheet: A table already exists.");
      return;
    }
    this.worksheetDataTables.set(sheetIndex, table);
  }
  static processTableConfig(worksheet, config) {
    var _a;
    if (!config.exportAsExcelTable) {
      return;
    }
    const tableConfig = typeof config.exportAsExcelTable === "boolean" ? {} : config.exportAsExcelTable;
    const {
      name: nameFromConfig,
      showColumnStripes,
      showRowStripes,
      showFilterButton,
      highlightFirstColumn,
      highlightLastColumn
    } = tableConfig;
    const tableName = this.getSanitizedTableName(
      nameFromConfig || _ExcelXlsxFactory.defaultTableDisplayName
    );
    const sheetIndex = this.sheetNames.length - 1;
    const { table } = worksheet;
    const { rows, columns } = table;
    const headerRowCount = config.columnModel.getHeaderRowCount();
    const tableHeaderRowIndex = headerRowCount - 1;
    const tableRowCount = rows.length;
    const tableColCount = columns.length;
    const tableColumns = [];
    const showFilterButtons = [];
    for (let i = 0; i < tableColCount; i++) {
      const col = columns[i];
      tableColumns.push(col.displayName || "");
      showFilterButtons.push(
        showFilterButton === "match" || showFilterButton === void 0 ? (_a = col.filterAllowed) != null ? _a : false : showFilterButton
      );
    }
    if (!tableColumns || !tableColumns.length || !tableRowCount || !tableName) {
      console.warn("Unable to add data table to Excel sheet: Missing required parameters.");
      return;
    }
    this.addTableToSheet(sheetIndex, {
      name: this.getTableNameFromIndex(sheetIndex),
      displayName: tableName,
      columns: tableColumns,
      showFilterButtons,
      headerRowIndex: tableHeaderRowIndex,
      rowCount: tableRowCount - headerRowCount,
      showRowStripes: showRowStripes != null ? showRowStripes : true,
      showColumnStripes: showColumnStripes != null ? showColumnStripes : false,
      highlightFirstColumn: highlightFirstColumn != null ? highlightFirstColumn : false,
      highlightLastColumn: highlightLastColumn != null ? highlightLastColumn : false
    });
  }
  static addHeaderFooterImageToMap(image, position) {
    const sheetIndex = this.sheetNames.length - 1;
    const headerFooterImage = image;
    headerFooterImage.headerFooterPosition = position;
    this.buildImageMap({ imageToAdd: headerFooterImage, idx: sheetIndex });
    let headerFooterImagesForSheet = this.worksheetHeaderFooterImages.get(sheetIndex);
    if (!headerFooterImagesForSheet) {
      headerFooterImagesForSheet = [];
      this.worksheetHeaderFooterImages.set(sheetIndex, headerFooterImagesForSheet);
    }
    if (!headerFooterImagesForSheet.find((img) => img.id === image.id)) {
      headerFooterImagesForSheet.push(image);
    }
  }
  static addBodyImageToMap(image, rowIndex, col, columnsToExport, rowHeight) {
    let sheetIndex = this.sheetNames.length;
    const { row, column } = image.position || {};
    const calculatedImage = image;
    if (columnsToExport) {
      if (rowIndex != null && col != null && (!row || !column)) {
        if (!image.position) {
          image.position = {};
        }
        image.position = Object.assign({}, image.position, {
          row: rowIndex,
          column: columnsToExport.indexOf(col) + 1
        });
      }
      setExcelImageTotalWidth(calculatedImage, columnsToExport);
      setExcelImageTotalHeight(calculatedImage, rowHeight);
    }
    this.buildImageMap({ imageToAdd: calculatedImage, idx: sheetIndex });
    let worksheetImageIdMap = this.worksheetImageIds.get(sheetIndex);
    if (!worksheetImageIdMap) {
      worksheetImageIdMap = /* @__PURE__ */ new Map();
      this.worksheetImageIds.set(sheetIndex, worksheetImageIdMap);
    }
    const sheetImages = this.worksheetImages.get(sheetIndex);
    if (!sheetImages) {
      this.worksheetImages.set(sheetIndex, [calculatedImage]);
    } else {
      sheetImages.push(calculatedImage);
    }
    if (!worksheetImageIdMap.get(image.id)) {
      worksheetImageIdMap.set(image.id, { index: worksheetImageIdMap.size, type: image.imageType });
    }
  }
  static buildImageMap(params) {
    const { imageToAdd, idx } = params;
    const mappedImagesToSheet = this.images.get(imageToAdd.id);
    if (mappedImagesToSheet) {
      const currentSheetImages = mappedImagesToSheet.find((currentImage) => currentImage.sheetId === idx);
      if (currentSheetImages) {
        currentSheetImages.image.push(imageToAdd);
      } else {
        mappedImagesToSheet.push({
          sheetId: idx,
          image: [imageToAdd]
        });
      }
    } else {
      this.images.set(imageToAdd.id, [{ sheetId: idx, image: [imageToAdd] }]);
      this.workbookImageIds.set(imageToAdd.id, { type: imageToAdd.imageType, index: this.workbookImageIds.size });
    }
  }
  static addSheetName(worksheet) {
    const name = import_core5._.escapeString(worksheet.name) || "";
    let append = "";
    while (this.sheetNames.indexOf(`${name}${append}`) !== -1) {
      if (append === "") {
        append = "_1";
      } else {
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
    this.sharedStrings = /* @__PURE__ */ new Map();
    this.images = /* @__PURE__ */ new Map();
    this.worksheetImages = /* @__PURE__ */ new Map();
    this.worksheetHeaderFooterImages = /* @__PURE__ */ new Map();
    this.workbookImageIds = /* @__PURE__ */ new Map();
    this.worksheetImageIds = /* @__PURE__ */ new Map();
    this.worksheetDataTables = /* @__PURE__ */ new Map();
    this.sheetNames = [];
    this.factoryMode = import_core5.ExcelFactoryMode.SINGLE_SHEET;
  }
  static createWorkbook() {
    return createXmlPart(workbook_default.getTemplate(this.sheetNames));
  }
  static createStylesheet(defaultFontSize) {
    return createXmlPart(stylesheet_default.getTemplate(defaultFontSize));
  }
  static createSharedStrings() {
    return createXmlPart(sharedStrings_default.getTemplate(this.sharedStrings));
  }
  static createCore(author) {
    return createXmlPart(core_default.getTemplate(author));
  }
  static createContentTypes(sheetLen) {
    return createXmlPart(contentTypes_default.getTemplate(sheetLen));
  }
  static createRels() {
    const rs = relationships_default.getTemplate([{
      Id: "rId1",
      Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
      Target: "xl/workbook.xml"
    }, {
      Id: "rId2",
      Type: "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties",
      Target: "docProps/core.xml"
    }]);
    return createXmlPart(rs);
  }
  static createTheme() {
    return createXmlPart(office_default.getTemplate());
  }
  static createTable(dataTable, index) {
    return createXmlPart(table_default.getTemplate(dataTable, index));
  }
  static createWorkbookRels(sheetLen) {
    const worksheets = new Array(sheetLen).fill(void 0).map((v, i) => ({
      Id: `rId${i + 1}`,
      Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
      Target: `worksheets/sheet${i + 1}.xml`
    }));
    const rs = relationships_default.getTemplate([
      ...worksheets,
      {
        Id: `rId${sheetLen + 1}`,
        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
        Target: "theme/theme1.xml"
      },
      {
        Id: `rId${sheetLen + 2}`,
        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
        Target: "styles.xml"
      },
      {
        Id: `rId${sheetLen + 3}`,
        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings",
        Target: "sharedStrings.xml"
      }
    ]);
    return createXmlPart(rs);
  }
  static createDrawing(sheetIndex) {
    return createXmlPart(drawing_default.getTemplate({ sheetIndex }));
  }
  static createDrawingRel(sheetIndex) {
    const worksheetImageIds = this.worksheetImageIds.get(sheetIndex) || [];
    const XMLArr = [];
    for (const [key, value] of worksheetImageIds) {
      XMLArr.push({
        Id: `rId${value.index + 1}`,
        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
        Target: `../media/image${this.workbookImageIds.get(key).index + 1}.${value.type}`
      });
    }
    return createXmlPart(relationships_default.getTemplate(XMLArr));
  }
  static createVmlDrawing(sheetIndex) {
    return createXmlPart(vmlDrawing_default.getTemplate({ sheetIndex }), true);
  }
  static createVmlDrawingRel(sheetIndex) {
    const worksheetHeaderFooterImages = this.worksheetHeaderFooterImages.get(sheetIndex) || [];
    const XMLArr = [];
    for (let i = 0; i < worksheetHeaderFooterImages.length; i++) {
      const headerFooterImage = worksheetHeaderFooterImages[i];
      const workbookImage = this.workbookImageIds.get(headerFooterImage.id);
      if (!workbookImage) {
        continue;
      }
      const { index, type } = workbookImage;
      const imageType = type === "jpg" ? "jpeg" : type;
      XMLArr.push({
        Id: `rId${i + 1}`,
        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
        Target: `../media/image${index + 1}.${imageType}`
      });
    }
    return createXmlPart(relationships_default.getTemplate(XMLArr));
  }
  static createRelationships({
    drawingIndex,
    vmlDrawingIndex,
    tableIndex
  } = {}) {
    if (drawingIndex === void 0 && vmlDrawingIndex === void 0 && tableIndex === void 0) {
      return "";
    }
    const config = [];
    if (drawingIndex != null) {
      config.push({
        Id: `rId${config.length + 1}`,
        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing",
        Target: `../drawings/drawing${drawingIndex + 1}.xml`
      });
    }
    if (vmlDrawingIndex != null) {
      config.push({
        Id: `rId${config.length + 1}`,
        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing",
        Target: `../drawings/vmlDrawing${vmlDrawingIndex + 1}.vml`
      });
    }
    if (tableIndex != null) {
      config.push({
        Id: `rId${config.length + 1}`,
        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/table",
        Target: `../tables/${this.getTableNameFromIndex(tableIndex)}.xml`
      });
    }
    const rs = relationships_default.getTemplate(config);
    return createXmlPart(rs);
  }
  static createWorksheet(worksheet, config) {
    return createXmlPart(worksheet_default.getTemplate({
      worksheet,
      currentSheet: this.sheetNames.length - 1,
      config
    }));
  }
};
_ExcelXlsxFactory.sharedStrings = /* @__PURE__ */ new Map();
_ExcelXlsxFactory.sheetNames = [];
/** Maps images to sheet */
_ExcelXlsxFactory.images = /* @__PURE__ */ new Map();
/** Maps sheets to images */
_ExcelXlsxFactory.worksheetImages = /* @__PURE__ */ new Map();
/** Maps sheets to header/footer images */
_ExcelXlsxFactory.worksheetHeaderFooterImages = /* @__PURE__ */ new Map();
/** Maps all workbook images to a global Id */
_ExcelXlsxFactory.workbookImageIds = /* @__PURE__ */ new Map();
/** Maps all sheet images to unique Ids */
_ExcelXlsxFactory.worksheetImageIds = /* @__PURE__ */ new Map();
/** Maps all sheet tables to unique Ids */
_ExcelXlsxFactory.worksheetDataTables = /* @__PURE__ */ new Map();
/** Default name to be used for tables when no name is provided */
_ExcelXlsxFactory.defaultTableDisplayName = "AG-GRID-TABLE";
_ExcelXlsxFactory.factoryMode = import_core5.ExcelFactoryMode.SINGLE_SHEET;
var ExcelXlsxFactory = _ExcelXlsxFactory;

// enterprise-modules/excel-export/src/excelExport/excelCreator.ts
var import_csv_export3 = require("@ag-grid-community/csv-export");

// enterprise-modules/excel-export/src/excelExport/excelSerializingSession.ts
var import_core7 = require("@ag-grid-community/core");
var import_csv_export2 = require("@ag-grid-community/csv-export");
var ExcelSerializingSession = class extends import_csv_export2.BaseGridSerializingSession {
  constructor(config) {
    super(config);
    this.mixedStyles = {};
    this.mixedStyleCounter = 0;
    this.rows = [];
    this.config = Object.assign({}, config);
    this.stylesByIds = {};
    this.config.baseExcelStyles.forEach((style) => {
      this.stylesByIds[style.id] = style;
    });
    this.excelStyles = [...this.config.baseExcelStyles, { id: "_quotePrefix", quotePrefix: 1 }];
  }
  addCustomContent(customContent) {
    customContent.forEach((row) => {
      const rowLen = this.rows.length + 1;
      let outlineLevel;
      if (!this.config.suppressRowOutline && row.outlineLevel != null) {
        outlineLevel = row.outlineLevel;
      }
      const rowObj = {
        height: getHeightFromProperty(rowLen, row.height || this.config.rowHeight),
        cells: (row.cells || []).map((cell, idx) => {
          var _a, _b, _c;
          const image = this.addImage(rowLen, this.columnsToExport[idx], (_a = cell.data) == null ? void 0 : _a.value);
          let excelStyles = null;
          if (cell.styleId) {
            excelStyles = typeof cell.styleId === "string" ? [cell.styleId] : cell.styleId;
          }
          const excelStyleId = this.getStyleId(excelStyles);
          if (image) {
            return this.createCell(excelStyleId, this.getDataTypeForValue(image.value), image.value == null ? "" : image.value);
          }
          const value = (_c = (_b = cell.data) == null ? void 0 : _b.value) != null ? _c : "";
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
        const styleIds = this.config.styleLinker({ rowType: import_csv_export2.RowType.HEADER_GROUPING, rowIndex: 1, value: `grouping-${header}`, columnGroup });
        currentCells.push(__spreadProps(__spreadValues({}, this.createMergedCell(this.getStyleId(styleIds), this.getDataTypeForValue("string"), header, span)), {
          collapsibleRanges
        }));
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
  prepare(columnsToExport) {
    super.prepare(columnsToExport);
    this.columnsToExport = [...columnsToExport];
    this.cols = columnsToExport.map((col, i) => this.convertColumnToExcel(col, i));
  }
  parse() {
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
  addRowOutlineIfNecessary(node) {
    const { gos, suppressRowOutline, rowGroupExpandState = "expanded" } = this.config;
    const isGroupHideOpenParents = gos.get("groupHideOpenParents");
    if (isGroupHideOpenParents || suppressRowOutline || node.level == null) {
      return;
    }
    const padding = node.footer ? 1 : 0;
    const currentRow = import_core7._.last(this.rows);
    currentRow.outlineLevel = node.level + padding;
    if (rowGroupExpandState === "expanded") {
      return;
    }
    const collapseAll = rowGroupExpandState === "collapsed";
    if (node.isExpandable()) {
      const isExpanded = !collapseAll && node.expanded;
      currentRow.collapsed = !isExpanded;
    }
    currentRow.hidden = // always show the node if there is no parent to be expanded
    !!node.parent && // or if it is a child of the root node
    node.parent.level !== -1 && (collapseAll || this.isAnyParentCollapsed(node.parent));
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
  convertColumnToExcel(column, index) {
    const columnWidth = this.config.columnWidth;
    const headerValue = column ? this.extractHeaderValue(column) : void 0;
    const displayName = headerValue != null ? headerValue : "";
    const filterAllowed = column ? column.isFilterAllowed() : false;
    if (columnWidth) {
      if (typeof columnWidth === "number") {
        return { width: columnWidth, displayName, filterAllowed };
      }
      return { width: columnWidth({ column, index }), displayName, filterAllowed };
    }
    if (column) {
      const smallestUsefulWidth = 75;
      return { width: Math.max(column.getActualWidth(), smallestUsefulWidth), displayName, filterAllowed };
    }
    return {
      displayName,
      filterAllowed
    };
  }
  onNewHeaderColumn(rowIndex, currentCells) {
    return (column) => {
      const nameForCol = this.extractHeaderValue(column);
      const styleIds = this.config.styleLinker({ rowType: import_csv_export2.RowType.HEADER, rowIndex, value: nameForCol, column });
      currentCells.push(this.createCell(this.getStyleId(styleIds), this.getDataTypeForValue("string"), nameForCol));
    };
  }
  onNewBodyColumn(rowIndex, currentCells) {
    let skipCols = 0;
    return (column, index, node) => {
      if (skipCols > 0) {
        skipCols -= 1;
        return;
      }
      const { value: valueForCell, valueFormatted } = this.extractRowCellValue(column, index, rowIndex, "excel", node);
      const styleIds = this.config.styleLinker({ rowType: import_csv_export2.RowType.BODY, rowIndex, value: valueForCell, column, node });
      const excelStyleId = this.getStyleId(styleIds);
      const colSpan = column.getColSpan(node);
      const addedImage = this.addImage(rowIndex, column, valueForCell);
      if (addedImage) {
        currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(addedImage.value), addedImage.value == null ? "" : addedImage.value));
      } else if (colSpan > 1) {
        skipCols = colSpan - 1;
        currentCells.push(this.createMergedCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell, colSpan - 1));
      } else {
        currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell, valueFormatted));
      }
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
  createExcel(data) {
    const { excelStyles, config } = this;
    return ExcelXlsxFactory.createExcel(
      excelStyles,
      data,
      config
    );
  }
  getDataTypeForValue(valueForCell) {
    if (valueForCell === void 0) {
      return "empty";
    }
    return this.isNumerical(valueForCell) ? "n" : "s";
  }
  getTypeFromStyle(style, value) {
    if (this.isFormula(value)) {
      return "f";
    }
    if (style && style.dataType) {
      switch (style.dataType.toLocaleLowerCase()) {
        case "formula":
          return "f";
        case "string":
          return "s";
        case "number":
          return "n";
        case "datetime":
          return "d";
        case "error":
          return "e";
        case "boolean":
          return "b";
        default:
          console.warn(`AG Grid: Unrecognized data type for excel export [${style.id}.dataType=${style.dataType}]`);
      }
    }
    return null;
  }
  addImage(rowIndex, column, value) {
    if (!this.config.addImageToCell) {
      return;
    }
    const addedImage = this.config.addImageToCell(rowIndex, column, value);
    if (!addedImage) {
      return;
    }
    ExcelXlsxFactory.addBodyImageToMap(addedImage.image, rowIndex, column, this.columnsToExport, this.config.rowHeight);
    return addedImage;
  }
  createCell(styleId, type, value, valueFormatted) {
    const actualStyle = this.getStyleById(styleId);
    if (!(actualStyle == null ? void 0 : actualStyle.dataType) && type === "s" && valueFormatted) {
      value = valueFormatted;
    }
    const processedType = this.getTypeFromStyle(actualStyle, value) || type;
    const { value: processedValue, escaped } = this.getCellValue(processedType, value);
    const styles = [];
    if (actualStyle) {
      styles.push(styleId);
    }
    if (escaped) {
      styles.push("_quotePrefix");
    }
    styleId = this.getStyleId(styles) || void 0;
    return {
      styleId,
      data: {
        type: processedType,
        value: processedValue
      }
    };
  }
  createMergedCell(styleId, type, value, numOfCells) {
    const valueToUse = value == null ? "" : value;
    return {
      styleId: !!this.getStyleById(styleId) ? styleId : void 0,
      data: {
        type,
        value: type === "s" ? ExcelXlsxFactory.getStringPosition(valueToUse).toString() : value
      },
      mergeAcross: numOfCells
    };
  }
  getCellValue(type, value) {
    let escaped = false;
    if (value == null) {
      type = "s";
      value = "";
    }
    if (type === "s") {
      if (value && value[0] === "'") {
        escaped = true;
        value = value.slice(1);
      }
      value = ExcelXlsxFactory.getStringPosition(value).toString();
    } else if (type === "f") {
      value = value.slice(1);
    } else if (type === "n") {
      const numberValue = Number(value);
      if (isNaN(numberValue)) {
        value = "";
      } else if (value !== "") {
        value = numberValue.toString();
      }
    }
    return { value, escaped };
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
  deepCloneObject(object) {
    return JSON.parse(JSON.stringify(object));
  }
  addNewMixedStyle(styleIds) {
    this.mixedStyleCounter += 1;
    const excelId = `mixedStyle${this.mixedStyleCounter}`;
    const resultantStyle = {};
    for (const styleId of styleIds) {
      for (const excelStyle of this.excelStyles) {
        if (excelStyle.id === styleId) {
          import_core7._.mergeDeep(resultantStyle, this.deepCloneObject(excelStyle));
        }
      }
    }
    resultantStyle.id = excelId;
    resultantStyle.name = excelId;
    const key = styleIds.join("-");
    this.mixedStyles[key] = {
      excelID: excelId,
      key,
      result: resultantStyle
    };
    this.excelStyles.push(resultantStyle);
    this.stylesByIds[excelId] = resultantStyle;
  }
  isFormula(value) {
    if (value == null) {
      return false;
    }
    return this.config.autoConvertFormulas && value.toString().startsWith("=");
  }
  isNumerical(value) {
    if (typeof value === "bigint") {
      return true;
    }
    return isFinite(value) && value !== "" && !isNaN(parseFloat(value));
  }
  getStyleById(styleId) {
    if (styleId == null) {
      return null;
    }
    return this.stylesByIds[styleId] || null;
  }
};

// enterprise-modules/excel-export/src/excelExport/excelCreator.ts
var createExcelXMLCoreFolderStructure = () => {
  import_csv_export3.ZipContainer.addFolders([
    "_rels/",
    "docProps/",
    "xl/",
    "xl/theme/",
    "xl/_rels/",
    "xl/worksheets/"
  ]);
  const { images } = ExcelXlsxFactory;
  if (!images.size) {
    return;
  }
  import_csv_export3.ZipContainer.addFolders([
    "xl/worksheets/_rels",
    "xl/drawings/",
    "xl/drawings/_rels",
    "xl/media/"
  ]);
  let imgCounter = 0;
  images.forEach((value) => {
    const firstImage = value[0].image[0];
    const { base64, imageType } = firstImage;
    const ext = imageType === "jpg" ? "jpeg" : imageType;
    import_csv_export3.ZipContainer.addFile(`xl/media/image${++imgCounter}.${ext}`, base64, true);
  });
};
var createExcelXmlWorksheets = (data) => {
  let imageRelationCounter = 0;
  let headerFooterImageCounter = 0;
  let tableRelationCounter = 0;
  const { images, worksheetDataTables, worksheetImages, worksheetHeaderFooterImages } = ExcelXlsxFactory;
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    import_csv_export3.ZipContainer.addFile(`xl/worksheets/sheet${i + 1}.xml`, value, false);
    const hasImages = images.size > 0 && worksheetImages.has(i);
    const hasTables = worksheetDataTables.size > 0 && worksheetDataTables.has(i);
    const hasHeaderFooterImages = images.size && worksheetHeaderFooterImages.has(i);
    if (!hasImages && !hasTables && !hasHeaderFooterImages) {
      continue;
    }
    let tableIndex;
    let drawingIndex;
    let vmlDrawingIndex;
    if (hasImages) {
      createExcelXmlDrawings(i, imageRelationCounter);
      drawingIndex = imageRelationCounter;
      imageRelationCounter++;
    }
    if (hasHeaderFooterImages) {
      createExcelVmlDrawings(i, headerFooterImageCounter);
      vmlDrawingIndex = headerFooterImageCounter;
      headerFooterImageCounter++;
    }
    if (hasTables) {
      tableIndex = tableRelationCounter++;
    }
    const worksheetRelFile = `xl/worksheets/_rels/sheet${i + 1}.xml.rels`;
    import_csv_export3.ZipContainer.addFile(
      worksheetRelFile,
      ExcelXlsxFactory.createRelationships({
        tableIndex,
        drawingIndex,
        vmlDrawingIndex
      })
    );
  }
};
var createExcelXmlDrawings = (sheetIndex, drawingIndex) => {
  const drawingFolder = "xl/drawings";
  const drawingFileName = `${drawingFolder}/drawing${drawingIndex + 1}.xml`;
  const relFileName = `${drawingFolder}/_rels/drawing${drawingIndex + 1}.xml.rels`;
  import_csv_export3.ZipContainer.addFile(relFileName, ExcelXlsxFactory.createDrawingRel(sheetIndex));
  import_csv_export3.ZipContainer.addFile(drawingFileName, ExcelXlsxFactory.createDrawing(sheetIndex));
};
var createExcelVmlDrawings = (sheetIndex, drawingIndex) => {
  const drawingFolder = "xl/drawings";
  const drawingFileName = `${drawingFolder}/vmlDrawing${drawingIndex + 1}.vml`;
  const relFileName = `${drawingFolder}/_rels/vmlDrawing${drawingIndex + 1}.vml.rels`;
  import_csv_export3.ZipContainer.addFile(drawingFileName, ExcelXlsxFactory.createVmlDrawing(sheetIndex));
  import_csv_export3.ZipContainer.addFile(relFileName, ExcelXlsxFactory.createVmlDrawingRel(sheetIndex));
};
var createExcelXmlTables = () => {
  const { worksheetDataTables } = ExcelXlsxFactory;
  const tablesDataByWorksheet = worksheetDataTables;
  const worksheetKeys = Array.from(tablesDataByWorksheet.keys());
  for (let i = 0; i < worksheetKeys.length; i++) {
    const sheetIndex = worksheetKeys[i];
    const dataTable = tablesDataByWorksheet.get(sheetIndex);
    if (!dataTable) {
      continue;
    }
    import_csv_export3.ZipContainer.addFile(
      `xl/tables/${dataTable.name}.xml`,
      ExcelXlsxFactory.createTable(dataTable, i)
    );
  }
};
var createExcelXmlCoreSheets = (fontSize, author, sheetLen) => {
  import_csv_export3.ZipContainer.addFile("xl/workbook.xml", ExcelXlsxFactory.createWorkbook());
  import_csv_export3.ZipContainer.addFile("xl/styles.xml", ExcelXlsxFactory.createStylesheet(fontSize));
  import_csv_export3.ZipContainer.addFile("xl/sharedStrings.xml", ExcelXlsxFactory.createSharedStrings());
  import_csv_export3.ZipContainer.addFile("xl/theme/theme1.xml", ExcelXlsxFactory.createTheme());
  import_csv_export3.ZipContainer.addFile("xl/_rels/workbook.xml.rels", ExcelXlsxFactory.createWorkbookRels(sheetLen));
  import_csv_export3.ZipContainer.addFile("docProps/core.xml", ExcelXlsxFactory.createCore(author));
  import_csv_export3.ZipContainer.addFile("[Content_Types].xml", ExcelXlsxFactory.createContentTypes(sheetLen));
  import_csv_export3.ZipContainer.addFile("_rels/.rels", ExcelXlsxFactory.createRels());
};
var createExcelFileForExcel = (data, options = {}) => {
  if (!data || data.length === 0) {
    console.warn("AG Grid: Invalid params supplied to createExcelFileForExcel() - `ExcelExportParams.data` is empty.");
    ExcelXlsxFactory.resetFactory();
    return false;
  }
  const {
    fontSize = 11,
    author = "AG Grid"
  } = options;
  createExcelXMLCoreFolderStructure();
  createExcelXmlTables();
  createExcelXmlWorksheets(data);
  createExcelXmlCoreSheets(fontSize, author, data.length);
  ExcelXlsxFactory.resetFactory();
  return true;
};
var getMultipleSheetsAsExcelCompressed = (params) => {
  const { data, fontSize, author } = params;
  const mimeType = params.mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (!createExcelFileForExcel(data, {
    author,
    fontSize
  })) {
    return Promise.resolve(void 0);
  }
  return import_csv_export3.ZipContainer.getZipFile(mimeType);
};
var getMultipleSheetsAsExcel = (params) => {
  const { data, fontSize, author } = params;
  const mimeType = params.mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (!createExcelFileForExcel(data, {
    author,
    fontSize
  })) {
    return;
  }
  return import_csv_export3.ZipContainer.getUncompressedZipFile(mimeType);
};
var exportMultipleSheetsAsExcel = (params) => {
  const { fileName = "export.xlsx" } = params;
  getMultipleSheetsAsExcelCompressed(params).then((contents) => {
    if (contents) {
      const downloadFileName = typeof fileName === "function" ? fileName() : fileName;
      import_csv_export3.Downloader.download(downloadFileName, contents);
    }
  });
};
var ExcelCreator = class extends import_csv_export3.BaseCreator {
  postConstruct() {
    this.setBeans({
      gridSerializer: this.gridSerializer,
      gos: this.gos
    });
  }
  getMergedParams(params) {
    const baseParams = this.gos.get("defaultExcelExportParams");
    return Object.assign({}, baseParams, params);
  }
  export(userParams) {
    if (this.isExportSuppressed()) {
      console.warn(`AG Grid: Export cancelled. Export is not allowed as per your configuration.`);
      return;
    }
    const mergedParams = this.getMergedParams(userParams);
    const data = this.getData(mergedParams);
    const exportParams = {
      data: [data],
      fontSize: mergedParams.fontSize,
      author: mergedParams.author,
      mimeType: mergedParams.mimeType
    };
    this.packageCompressedFile(exportParams).then((packageFile) => {
      if (packageFile) {
        const { fileName } = mergedParams;
        const providedFileName = typeof fileName === "function" ? fileName(this.gos.getGridCommonParams()) : fileName;
        import_csv_export3.Downloader.download(this.getFileName(providedFileName), packageFile);
      }
    });
  }
  exportDataAsExcel(params) {
    this.export(params);
  }
  getDataAsExcel(params) {
    const mergedParams = this.getMergedParams(params);
    const data = this.getData(mergedParams);
    const exportParams = {
      data: [data],
      fontSize: mergedParams.fontSize,
      author: mergedParams.author,
      mimeType: mergedParams.mimeType
    };
    return this.packageFile(exportParams);
  }
  setFactoryMode(factoryMode) {
    ExcelXlsxFactory.factoryMode = factoryMode;
  }
  getFactoryMode() {
    return ExcelXlsxFactory.factoryMode;
  }
  getSheetDataForExcel(params) {
    const mergedParams = this.getMergedParams(params);
    return this.getData(mergedParams);
  }
  getMultipleSheetsAsExcel(params) {
    return getMultipleSheetsAsExcel(params);
  }
  exportMultipleSheetsAsExcel(params) {
    exportMultipleSheetsAsExcel(params);
  }
  getDefaultFileExtension() {
    return "xlsx";
  }
  createSerializingSession(params) {
    const { columnModel, valueService, gos } = this;
    let sheetName;
    if (params.sheetName != null) {
      const { sheetName: sheetNameParam } = params;
      const sheetNameValue = typeof sheetNameParam === "function" ? sheetNameParam(this.gos.getGridCommonParams()) : sheetNameParam;
      sheetName = String(sheetNameValue).substring(0, 31);
    } else {
      sheetName = "ag-grid";
    }
    const config = __spreadProps(__spreadValues({}, params), {
      sheetName,
      columnModel,
      valueService,
      gos,
      suppressRowOutline: params.suppressRowOutline || params.skipRowGroups,
      headerRowHeight: params.headerRowHeight || params.rowHeight,
      baseExcelStyles: this.gos.get("excelStyles") || [],
      styleLinker: this.styleLinker.bind(this)
    });
    return new ExcelSerializingSession(config);
  }
  styleLinker(params) {
    const { rowType, rowIndex, value, column, columnGroup, node } = params;
    const isHeader = rowType === import_csv_export3.RowType.HEADER;
    const isGroupHeader = rowType === import_csv_export3.RowType.HEADER_GROUPING;
    const col = isHeader ? column : columnGroup;
    let headerClasses = [];
    if (isHeader || isGroupHeader) {
      headerClasses.push("header");
      if (isGroupHeader) {
        headerClasses.push("headerGroup");
      }
      if (col) {
        headerClasses = headerClasses.concat(import_core8.CssClassApplier.getHeaderClassesFromColDef(
          col.getDefinition(),
          this.gos,
          column || null,
          columnGroup || null
        ));
      }
      return headerClasses;
    }
    const styles = this.gos.get("excelStyles");
    const applicableStyles = ["cell"];
    if (!styles || !styles.length) {
      return applicableStyles;
    }
    const styleIds = styles.map((it) => {
      return it.id;
    });
    this.stylingService.processAllCellClasses(
      column.getDefinition(),
      this.gos.addGridCommonParams({
        value,
        data: node.data,
        node,
        colDef: column.getDefinition(),
        column,
        rowIndex
      }),
      (className) => {
        if (styleIds.indexOf(className) > -1) {
          applicableStyles.push(className);
        }
      }
    );
    return applicableStyles.sort((left, right) => {
      return styleIds.indexOf(left) < styleIds.indexOf(right) ? -1 : 1;
    });
  }
  isExportSuppressed() {
    return this.gos.get("suppressExcelExport");
  }
  packageCompressedFile(params) {
    return getMultipleSheetsAsExcelCompressed(params);
  }
  packageFile(params) {
    return getMultipleSheetsAsExcel(params);
  }
};
__decorateClass([
  (0, import_core8.Autowired)("columnModel")
], ExcelCreator.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core8.Autowired)("valueService")
], ExcelCreator.prototype, "valueService", 2);
__decorateClass([
  (0, import_core8.Autowired)("stylingService")
], ExcelCreator.prototype, "stylingService", 2);
__decorateClass([
  (0, import_core8.Autowired)("gridSerializer")
], ExcelCreator.prototype, "gridSerializer", 2);
__decorateClass([
  (0, import_core8.Autowired)("gridOptionsService")
], ExcelCreator.prototype, "gos", 2);
__decorateClass([
  import_core8.PostConstruct
], ExcelCreator.prototype, "postConstruct", 1);
ExcelCreator = __decorateClass([
  (0, import_core8.Bean)("excelCreator")
], ExcelCreator);

// enterprise-modules/excel-export/src/excelExportModule.ts
var import_csv_export4 = require("@ag-grid-community/csv-export");
var import_csv_export5 = require("@ag-grid-community/csv-export");

// enterprise-modules/excel-export/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/excel-export/src/excelExportModule.ts
var ExcelExportModule = {
  version: VERSION,
  moduleName: import_core9.ModuleNames.ExcelExportModule,
  beans: [
    // beans in this module
    ExcelCreator,
    // these beans are part of CSV Export module
    import_csv_export4.GridSerializer,
    import_csv_export4.CsvCreator
  ],
  dependantModules: [
    import_csv_export5.CsvExportModule,
    import_core10.EnterpriseCoreModule
  ]
};

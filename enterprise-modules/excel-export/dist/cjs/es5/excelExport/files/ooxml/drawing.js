"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var excelXlsxFactory_1 = require("../../excelXlsxFactory");
var excelUtils_1 = require("../../assets/excelUtils");
var getAnchor = function (name, imageAnchor) { return ({
    name: "xdr:" + name,
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
}); };
var getExt = function (image) {
    var children = [{
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
    var recolor = image.recolor && image.recolor.toLowerCase();
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
        children: children
    };
};
var getNvPicPr = function (image, index) { return ({
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
}); };
var getColorDetails = function (color) {
    if (!color.saturation && !color.tint) {
        return;
    }
    var ret = [];
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
var getDuoTone = function (primaryColor, secondaryColor) {
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
var getBlipFill = function (image, index) {
    var blipChildren;
    if (image.transparency) {
        var transparency = Math.min(Math.max(image.transparency, 0), 100);
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
            default:
        }
    }
    return ({
        name: 'xdr:blipFill',
        children: [{
                name: 'a:blip',
                properties: {
                    rawMap: {
                        'cstate': 'print',
                        'r:embed': "rId" + index,
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
var getSpPr = function (image, imageBoxSize) {
    var xfrm = {
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
        var rotation = image.rotation;
        xfrm.properties = {
            rawMap: {
                rot: Math.min(Math.max(rotation, 0), 360) * 60000
            }
        };
    }
    var prstGeom = {
        name: 'a:prstGeom',
        properties: {
            rawMap: {
                prst: 'rect'
            }
        },
        children: [{ name: 'a:avLst' }]
    };
    var ret = {
        name: 'xdr:spPr',
        children: [xfrm, prstGeom]
    };
    return ret;
};
var getImageBoxSize = function (image) {
    image.fitCell = !!image.fitCell || (!image.width || !image.height);
    var _a = image.position, position = _a === void 0 ? {} : _a, fitCell = image.fitCell, _b = image.width, width = _b === void 0 ? 0 : _b, _c = image.height, height = _c === void 0 ? 0 : _c, totalHeight = image.totalHeight, totalWidth = image.totalWidth;
    var _d = position.offsetX, offsetX = _d === void 0 ? 0 : _d, _e = position.offsetY, offsetY = _e === void 0 ? 0 : _e, _f = position.row, row = _f === void 0 ? 1 : _f, _g = position.rowSpan, rowSpan = _g === void 0 ? 1 : _g, _h = position.column, column = _h === void 0 ? 1 : _h, _j = position.colSpan, colSpan = _j === void 0 ? 1 : _j;
    return {
        from: {
            row: row - 1,
            col: column - 1,
            offsetX: excelUtils_1.pixelsToEMU(offsetX),
            offsetY: excelUtils_1.pixelsToEMU(offsetY)
        },
        to: {
            row: (row - 1) + (fitCell ? 1 : rowSpan - 1),
            col: (column - 1) + (fitCell ? 1 : colSpan - 1),
            offsetX: excelUtils_1.pixelsToEMU(width + offsetX),
            offsetY: excelUtils_1.pixelsToEMU(height + offsetY)
        },
        height: excelUtils_1.pixelsToEMU(totalHeight || height),
        width: excelUtils_1.pixelsToEMU(totalWidth || width)
    };
};
var getPicture = function (image, currentIndex, worksheetImageIndex, imageBoxSize) {
    return {
        name: 'xdr:pic',
        children: [
            getNvPicPr(image, currentIndex + 1),
            getBlipFill(image, worksheetImageIndex + 1),
            getSpPr(image, imageBoxSize)
        ]
    };
};
var drawingFactory = {
    getTemplate: function (config) {
        var sheetIndex = config.sheetIndex;
        var sheetImages = excelXlsxFactory_1.ExcelXlsxFactory.worksheetImages.get(sheetIndex);
        var sheetImageIds = excelXlsxFactory_1.ExcelXlsxFactory.worksheetImageIds.get(sheetIndex);
        var children = sheetImages.map(function (image, idx) {
            var boxSize = getImageBoxSize(image);
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
            children: children
        };
    }
};
exports.default = drawingFactory;

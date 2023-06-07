import { ExcelXlsxFactory } from '../../excelXlsxFactory';
import { pixelsToEMU } from '../../assets/excelUtils';
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
        var sheetImages = ExcelXlsxFactory.worksheetImages.get(sheetIndex);
        var sheetImageIds = ExcelXlsxFactory.worksheetImageIds.get(sheetIndex);
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
export default drawingFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9kcmF3aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRTFELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUV0RCxJQUFNLFNBQVMsR0FBRyxVQUFDLElBQVksRUFBRSxXQUF3QixJQUFpQixPQUFBLENBQUM7SUFDdkUsSUFBSSxFQUFFLFNBQU8sSUFBTTtJQUNuQixRQUFRLEVBQUUsQ0FBQztZQUNQLElBQUksRUFBRSxTQUFTO1lBQ2YsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRTtTQUN6QyxFQUFFO1lBQ0MsSUFBSSxFQUFFLFlBQVk7WUFDbEIsUUFBUSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1NBQzNDLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLFFBQVEsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtTQUN2QyxFQUFFO1lBQ0MsSUFBSSxFQUFFLFlBQVk7WUFDbEIsUUFBUSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1NBQzNDLENBQUM7Q0FDTCxDQUFDLEVBZndFLENBZXhFLENBQUM7QUFFSCxJQUFNLE1BQU0sR0FBRyxVQUFDLEtBQWlCO0lBQzdCLElBQU0sUUFBUSxHQUFpQixDQUFDO1lBQzVCLElBQUksRUFBRSxPQUFPO1lBQ2IsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsd0NBQXdDO2lCQUNoRDthQUNKO1lBQ0QsUUFBUSxFQUFFLENBQUM7b0JBQ1AsSUFBSSxFQUFFLGdCQUFnQjtvQkFDdEIsVUFBVSxFQUFFO3dCQUNSLE1BQU0sRUFBRTs0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
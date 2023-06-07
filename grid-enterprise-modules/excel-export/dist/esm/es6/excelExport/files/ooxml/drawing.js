import { ExcelXlsxFactory } from '../../excelXlsxFactory';
import { pixelsToEMU } from '../../assets/excelUtils';
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
export default drawingFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9kcmF3aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRTFELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUV0RCxNQUFNLFNBQVMsR0FBRyxDQUFDLElBQVksRUFBRSxXQUF3QixFQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZFLElBQUksRUFBRSxPQUFPLElBQUksRUFBRTtJQUNuQixRQUFRLEVBQUUsQ0FBQztZQUNQLElBQUksRUFBRSxTQUFTO1lBQ2YsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRTtTQUN6QyxFQUFFO1lBQ0MsSUFBSSxFQUFFLFlBQVk7WUFDbEIsUUFBUSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1NBQzNDLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLFFBQVEsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtTQUN2QyxFQUFFO1lBQ0MsSUFBSSxFQUFFLFlBQVk7WUFDbEIsUUFBUSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1NBQzNDLENBQUM7Q0FDTCxDQUFDLENBQUM7QUFFSCxNQUFNLE1BQU0sR0FBRyxDQUFDLEtBQWlCLEVBQWMsRUFBRTtJQUM3QyxNQUFNLFFBQVEsR0FBaUIsQ0FBQztZQUM1QixJQUFJLEVBQUUsT0FBTztZQUNiLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLHdDQUF3QztpQkFDaEQ7YUFDSjtZQUNELFFBQVEsRUFBRSxDQUFDO29CQUNQLElBQUksRUFBRSxnQkFBZ0I7b0JBQ3RCLFVBQVUsRUFBRTt3QkFDUixNQUFNLEVBQUU7NEJBQ0osSUFBSSxFQUFFLHdDQUF3Qzs0QkFDOUMsV0FBVyxFQUFFLHVEQUF1RDt5QkFDdkU7cUJBQ0o7aUJBQ0osQ0FBQztTQUNMLENBQUMsQ0FBQztJQUNILE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUU3RCxRQUFRLE9BQU8sRUFBRTtRQUNiLEtBQUssV0FBVyxDQUFDO1FBQ2pCLEtBQUssT0FBTyxDQUFDO1FBQ2IsS0FBSyxTQUFTO1lBQ1YsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDVixJQUFJLEVBQUUsT0FBTztnQkFDYixVQUFVLEVBQUU7b0JBQ1IsTUFBTSxFQUFFO3dCQUNKLEdBQUcsRUFBRSx3Q0FBd0M7cUJBQ2hEO2lCQUNKO2dCQUNELFFBQVEsRUFBRSxDQUFDO3dCQUNQLElBQUksRUFBRSxpQkFBaUI7d0JBQ3ZCLFVBQVUsRUFBRTs0QkFDUixNQUFNLEVBQUU7Z0NBQ0osS0FBSyxFQUFFLEdBQUc7Z0NBQ1YsWUFBWSxFQUFFLDZEQUE2RDs2QkFDOUU7eUJBQ0o7cUJBQ0osQ0FBQzthQUNMLENBQUMsQ0FBQztLQUNWO0lBRUQsT0FBTztRQUNILElBQUksRUFBRSxVQUFVO1FBQ2hCLFFBQVE7S0FDWCxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFpQixFQUFFLEtBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN0RCxJQUFJLEVBQUUsYUFBYTtJQUNuQixRQUFRLEVBQUUsQ0FBQztZQUNQLElBQUksRUFBRSxXQUFXO1lBQ2pCLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osRUFBRSxFQUFFLEtBQUs7b0JBQ1QsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO29CQUNkLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUztpQkFDM0Q7YUFDSjtZQUNELFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM1QixFQUFFO1lBQ0MsSUFBSSxFQUFFLGNBQWM7WUFDcEIsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixvQkFBb0IsRUFBRSxHQUFHO2lCQUM1QjthQUNKO1lBQ0QsUUFBUSxFQUFFLENBQUM7b0JBQ1AsSUFBSSxFQUFFLFlBQVk7aUJBQ3JCLENBQUM7U0FDTCxDQUFDO0NBQ0wsQ0FBQyxDQUFDO0FBRUgsTUFBTSxlQUFlLEdBQUcsQ0FBQyxLQUFpQixFQUE0QixFQUFFO0lBQ3BFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUFFLE9BQU87S0FBRTtJQUNqRCxNQUFNLEdBQUcsR0FBaUIsRUFBRSxDQUFDO0lBRTdCLElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRTtRQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ0wsSUFBSSxFQUFFLFVBQVU7WUFDaEIsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJO2lCQUMvQjthQUNKO1NBQ0osQ0FBQyxDQUFDO0tBQ047SUFFRCxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDWixHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ0wsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUk7aUJBQ3pCO2FBQ0o7U0FDSixDQUFDLENBQUM7S0FDTjtJQUVELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQUcsQ0FBQyxZQUF3QixFQUFFLGNBQTBCLEVBQWMsRUFBRTtJQUNwRixPQUFPLENBQUM7UUFDSixJQUFJLEVBQUUsV0FBVztRQUNqQixRQUFRLEVBQUUsQ0FBQztnQkFDUCxJQUFJLEVBQUUsV0FBVztnQkFDakIsVUFBVSxFQUFFO29CQUNSLE1BQU0sRUFBRTt3QkFDSixHQUFHLEVBQUUsWUFBWSxDQUFDLEtBQUs7cUJBQzFCO2lCQUNKO2dCQUNELFFBQVEsRUFBRSxlQUFlLENBQUMsWUFBWSxDQUFDO2FBQzFDLEVBQUU7Z0JBQ0MsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLFVBQVUsRUFBRTtvQkFDUixNQUFNLEVBQUU7d0JBQ0osR0FBRyxFQUFFLGNBQWMsQ0FBQyxLQUFLO3FCQUM1QjtpQkFDSjtnQkFDRCxRQUFRLEVBQUUsZUFBZSxDQUFDLGNBQWMsQ0FBQzthQUM1QyxDQUFDO0tBQ0wsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBRUYsTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFpQixFQUFFLEtBQWEsRUFBRSxFQUFFO0lBQ3JELElBQUksWUFBc0MsQ0FBQztJQUUzQyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUU7UUFDcEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDcEUsWUFBWSxHQUFHLENBQUM7Z0JBQ1osSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLFVBQVUsRUFBRTtvQkFDUixNQUFNLEVBQUU7d0JBQ0osR0FBRyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7cUJBQ2hEO2lCQUNKO2FBQ0osQ0FBQyxDQUFDO0tBQ047SUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7UUFDZixJQUFJLENBQUMsWUFBWSxFQUFFO1lBQUUsWUFBWSxHQUFHLEVBQUUsQ0FBQztTQUFFO1FBQ3pDLFFBQVEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1lBQ3ZDLEtBQUssV0FBVztnQkFDWixZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQ3pDLE1BQU07WUFDVixLQUFLLE9BQU87Z0JBQ1IsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbEcsTUFBTTtZQUNWLEtBQUssU0FBUztnQkFDVixZQUFZLENBQUMsSUFBSSxDQUFDO29CQUNkLElBQUksRUFBRSxPQUFPO29CQUNiLFVBQVUsRUFBRTt3QkFDUixNQUFNLEVBQUU7NEJBQ0osTUFBTSxFQUFFLE9BQU87NEJBQ2YsUUFBUSxFQUFFLFFBQVE7eUJBQ3JCO3FCQUNKO2lCQUNKLENBQUMsQ0FBQztnQkFDSCxNQUFNO1lBQ1YsUUFBUTtTQUNYO0tBQ0o7SUFFRCxPQUFPLENBQUM7UUFDSixJQUFJLEVBQUUsY0FBYztRQUNwQixRQUFRLEVBQUUsQ0FBQztnQkFDUCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxVQUFVLEVBQUU7b0JBQ1IsTUFBTSxFQUFFO3dCQUNKLFFBQVEsRUFBRSxPQUFPO3dCQUNqQixTQUFTLEVBQUUsTUFBTSxLQUFLLEVBQUU7d0JBQ3hCLFNBQVMsRUFBRSxxRUFBcUU7cUJBQ25GO2lCQUNKO2dCQUNELFFBQVEsRUFBRSxZQUFZO2FBQ3pCLEVBQUU7Z0JBQ0MsSUFBSSxFQUFDLFdBQVc7Z0JBQ2hCLFFBQVEsRUFBRSxDQUFDO3dCQUNQLElBQUksRUFBRSxZQUFZO3FCQUNyQixDQUFDO2FBQ0wsQ0FBQztLQUNMLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUVGLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBaUIsRUFBRSxZQUEwQixFQUFFLEVBQUU7SUFDOUQsTUFBTSxJQUFJLEdBQWU7UUFDckIsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsQ0FBQztnQkFDUCxJQUFJLEVBQUUsT0FBTztnQkFDYixVQUFVLEVBQUU7b0JBQ1IsTUFBTSxFQUFFO3dCQUNKLENBQUMsRUFBRSxDQUFDO3dCQUNKLENBQUMsRUFBRSxDQUFDO3FCQUNQO2lCQUNKO2FBQ0osRUFBRTtnQkFDQyxJQUFJLEVBQUUsT0FBTztnQkFDYixVQUFVLEVBQUU7b0JBQ1IsTUFBTSxFQUFFO3dCQUNKLEVBQUUsRUFBRSxZQUFZLENBQUMsS0FBSzt3QkFDdEIsRUFBRSxFQUFFLFlBQVksQ0FBQyxNQUFNO3FCQUMxQjtpQkFDSjthQUNKLENBQUM7S0FDTCxDQUFDO0lBRUYsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1FBQ2hCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDaEMsSUFBSSxDQUFDLFVBQVUsR0FBRztZQUNkLE1BQU0sRUFBRTtnQkFDSixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxLQUFLO2FBQ3BEO1NBQ0osQ0FBQztLQUNMO0lBRUQsTUFBTSxRQUFRLEdBQWU7UUFDekIsSUFBSSxFQUFFLFlBQVk7UUFDbEIsVUFBVSxFQUFFO1lBQ1IsTUFBTSxFQUFFO2dCQUNKLElBQUksRUFBRSxNQUFNO2FBQ2Y7U0FDSjtRQUNELFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDO0tBQ2xDLENBQUM7SUFFRixNQUFNLEdBQUcsR0FBRztRQUNSLElBQUksRUFBRSxVQUFVO1FBQ2hCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUM7S0FDN0IsQ0FBQztJQUVGLE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUYsTUFBTSxlQUFlLEdBQUcsQ0FBQyxLQUEyQixFQUFnQixFQUFFO0lBQ2xFLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbkUsTUFBTSxFQUFFLFFBQVEsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEdBQUcsS0FBSyxDQUFDO0lBQ3pGLE1BQU0sRUFBRSxPQUFPLEdBQUcsQ0FBQyxFQUFHLE9BQU8sR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUU5RixPQUFPO1FBQ0gsSUFBSSxFQUFFO1lBQ0YsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO1lBQ1osR0FBRyxFQUFFLE1BQU0sR0FBRyxDQUFDO1lBQ2YsT0FBTyxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUM7WUFDN0IsT0FBTyxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUM7U0FDaEM7UUFDRCxFQUFFLEVBQUU7WUFDQSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUM1QyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUMvQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7WUFDckMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO1NBQ3pDO1FBQ0QsTUFBTSxFQUFFLFdBQVcsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDO1FBQzFDLEtBQUssRUFBRSxXQUFXLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQztLQUMxQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQUcsQ0FDZixLQUFpQixFQUNqQixZQUFvQixFQUNwQixtQkFBMkIsRUFDM0IsWUFBMEIsRUFDaEIsRUFBRTtJQUNaLE9BQU87UUFDSCxJQUFJLEVBQUUsU0FBUztRQUNmLFFBQVEsRUFBRTtZQUNOLFVBQVUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxHQUFHLENBQUMsQ0FBQztZQUNuQyxXQUFXLENBQUMsS0FBSyxFQUFFLG1CQUFtQixHQUFHLENBQUMsQ0FBQztZQUMzQyxPQUFPLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQztTQUMvQjtLQUNKLENBQUM7QUFDTixDQUFDLENBQUM7QUFFRixNQUFNLGNBQWMsR0FBdUI7SUFDdkMsV0FBVyxDQUFDLE1BRVg7UUFDRyxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQzlCLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckUsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpFLE1BQU0sUUFBUSxHQUFHLFdBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDN0MsTUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sQ0FBQztnQkFDSixJQUFJLEVBQUUsbUJBQW1CO2dCQUN6QixVQUFVLEVBQUU7b0JBQ1IsTUFBTSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxVQUFVO3FCQUNyQjtpQkFDSjtnQkFDRCxRQUFRLEVBQUU7b0JBQ04sU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDO29CQUMvQixTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQzNCLFVBQVUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLGFBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUM7b0JBQ3BFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2lCQUM1QjthQUNKLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTztZQUNILElBQUksRUFBRSxVQUFVO1lBQ2hCLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osU0FBUyxFQUFFLHVEQUF1RDtvQkFDbEUsV0FBVyxFQUFFLHFFQUFxRTtpQkFDckY7YUFDSjtZQUNELFFBQVE7U0FDWCxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLGNBQWMsQ0FBQyJ9
import { _ } from '@ag-grid-community/core';
import columnFactory from './column';
import rowFactory from './row';
import mergeCellFactory from './mergeCell';
import { ExcelXlsxFactory } from '../../excelXlsxFactory';
import { getExcelColumnName } from '../../assets/excelUtils';
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
export default worksheetFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NoZWV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3dvcmtzaGVldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBWUgsQ0FBQyxFQUNKLE1BQU0seUJBQXlCLENBQUM7QUFFakMsT0FBTyxhQUFhLE1BQU0sVUFBVSxDQUFDO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLGdCQUFnQixNQUFNLGFBQWEsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUc3RCxNQUFNLGdDQUFnQyxHQUFHLENBQUMsSUFBZ0IsRUFBRSxJQUFtQixFQUFFLHFCQUE4QixFQUFZLEVBQUU7SUFDekgsTUFBTSxXQUFXLEdBQWEsRUFBRSxDQUFDO0lBQ2pDLE1BQU0sMEJBQTBCLEdBQWUsRUFBRSxDQUFDO0lBRWxELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDaEMsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUMvQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLE9BQW9CLENBQUM7UUFFekIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQXNCLEVBQUUsT0FBZSxFQUFFLEVBQUU7WUFDdEQsTUFBTSxHQUFHLEdBQUcsT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDakMsTUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUU3QixJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3pCLE1BQU0sSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDO2dCQUNsQyxNQUFNLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUVyRCxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLFNBQVMsSUFBSSxHQUFHLEdBQUcsU0FBUyxFQUFFLENBQUMsQ0FBQzthQUMvRDtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUNoQixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQWlCLENBQUM7YUFDckM7WUFFRCxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxXQUFXLENBQUM7WUFFMUMsSUFBSSxpQkFBaUIsRUFBRTtnQkFDbkIsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUM5QiwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxDQUFDLENBQUMsQ0FBQzthQUNOO1lBRUQsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEIsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDbEIsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDbEIsV0FBVyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxTQUFTLEVBQUUsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3JDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUFDO1FBQ3hDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO0lBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBRS9DLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRTtRQUM3QyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUMsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV4QyxJQUFJLEtBQUssRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1NBQUU7UUFDNUIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFaEMsT0FBUSxJQUFJLENBQUM7SUFDakIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsTUFBTSxtQkFBbUIsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxJQUFJLENBQUM7WUFDTixHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNiLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2IsWUFBWSxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLElBQUksQ0FBQyxDQUFDO1lBQzVFLEtBQUssRUFBRSxDQUFDLE1BQU0sSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUs7U0FDMUMsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvRCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUMsQ0FBQztBQUVGLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxXQUFzQyxFQUE0QixFQUFFO0lBQzVGLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLEtBQUssVUFBVSxJQUFJLFdBQVcsS0FBSyxXQUFXLENBQUMsRUFBRTtRQUM3RSxPQUFPLFVBQVUsQ0FBQztLQUNyQjtJQUVELE9BQU8sV0FBVyxDQUFDLGlCQUFpQixFQUE4QixDQUFDO0FBQ3ZFLENBQUMsQ0FBQztBQUVGLE1BQU0sV0FBVyxHQUFHLENBQUMsUUFBaUIsRUFBVSxFQUFFO0lBQzlDLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtRQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQUU7SUFFbkMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztJQUN6VSxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXhDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQztBQUVGLE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBc0IsRUFBRSxFQUFFO0lBQzFDLE9BQU8sQ0FBQyxRQUFzQixFQUFFLEVBQUU7UUFDOUIsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQ2hCLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ1YsSUFBSSxFQUFFLE1BQU07Z0JBQ1osUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3JFLENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFnQixFQUFFLFdBQW1CLEVBQUUsRUFBRTtJQUMzRCxPQUFPLENBQUMsUUFBc0IsRUFBRSxFQUFFO1FBQzlCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNiLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ1YsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ2xGLENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxhQUFhLEdBQUcsQ0FBQyxVQUFvQixFQUFFLEVBQUU7SUFDM0MsT0FBTyxDQUFDLFFBQXNCLEVBQUUsRUFBRTtRQUM5QixJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDbkIsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDVixJQUFJLEVBQUUsWUFBWTtnQkFDbEIsVUFBVSxFQUFFO29CQUNSLE1BQU0sRUFBRTt3QkFDSixLQUFLLEVBQUUsVUFBVSxDQUFDLE1BQU07cUJBQzNCO2lCQUNKO2dCQUNELFFBQVEsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ25GLENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxjQUFjLEdBQUcsQ0FBQyxPQUF5QixFQUFFLEVBQUU7SUFDakQsT0FBTyxDQUFDLFFBQXNCLEVBQUUsRUFBRTtRQUM5QixNQUFNLEVBQUUsR0FBRyxHQUFHLElBQUksRUFBRSxLQUFLLEdBQUcsR0FBRyxFQUFFLE1BQU0sR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLEdBQUcsRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFbkcsUUFBUSxDQUFDLElBQUksQ0FBQztZQUNWLElBQUksRUFBRSxhQUFhO1lBQ25CLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRTthQUN2RDtTQUNKLENBQUMsQ0FBQztRQUVILE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQztBQUVGLE1BQU0sWUFBWSxHQUFHLENBQUMsU0FBK0IsRUFBRSxFQUFFO0lBQ3JELE9BQU8sQ0FBQyxRQUFzQixFQUFFLEVBQUU7UUFDOUIsSUFBSSxTQUFTLEVBQUU7WUFDWCxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUNWLElBQUksRUFBRSxXQUFXO2dCQUNqQixVQUFVLEVBQUU7b0JBQ1IsTUFBTSxFQUFFO3dCQUNKLGFBQWEsRUFBRSxDQUFDO3dCQUNoQixXQUFXLEVBQUUsQ0FBQzt3QkFDZCxXQUFXLEVBQUUsa0JBQWtCLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQzt3QkFDdEQsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO3FCQUM3QztpQkFDSjthQUNKLENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSx5QkFBeUIsR0FBRyxDQUFDLEtBQWEsRUFBVSxFQUFFO0lBQ3hELE1BQU0sR0FBRyxHQUFHO1FBQ1IsU0FBUyxFQUFFLElBQUk7UUFDZixVQUFVLEVBQUUsSUFBSTtRQUNoQixTQUFTLEVBQUUsSUFBSTtRQUNmLFNBQVMsRUFBRSxJQUFJO1FBQ2YsUUFBUSxFQUFFLElBQUk7UUFDZCxTQUFTLEVBQUUsSUFBSTtRQUNmLFNBQVMsRUFBRSxJQUFJO0tBQ2xCLENBQUM7SUFFRixDQUFDLENBQUMsYUFBYSxDQUFTLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUN0QyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDLENBQUM7QUFFRixNQUFNLGlCQUFpQixHQUFHLENBQUMsUUFBaUIsRUFBVSxFQUFFO0lBQ3BELElBQUksUUFBUSxLQUFLLFFBQVEsRUFBRTtRQUFFLE9BQU8sR0FBRyxDQUFDO0tBQUU7SUFDMUMsSUFBSSxRQUFRLEtBQUssT0FBTyxFQUFFO1FBQUUsT0FBTyxHQUFHLENBQUM7S0FBRTtJQUV6QyxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxZQUFvQixFQUFFLElBQWdCLEVBQVUsRUFBRTtJQUM1RSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQUUsT0FBTyxZQUFZLENBQUM7S0FBRTtJQUVuQyxZQUFZLElBQUksYUFBYSxDQUFDO0lBQzlCLFlBQVksSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQztJQUUzQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUMzQixZQUFZLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7S0FDbkQ7U0FBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDbEIsWUFBWSxJQUFJLGNBQWMsQ0FBQztLQUNsQztTQUFNO1FBQ0gsWUFBWSxJQUFJLFVBQVUsQ0FBQztLQUM5QjtJQUNELFlBQVksSUFBSSxRQUFRLENBQUM7SUFFekIsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQUUsWUFBWSxJQUFJLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQUU7SUFDdkQsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1FBQUUsWUFBWSxJQUFJLFFBQVEsQ0FBQztLQUFFO0lBQ3JELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNoQixZQUFZLElBQUksUUFBUSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNwRTtJQUNGLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtRQUFFLFlBQVksSUFBSSxTQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO0tBQUU7SUFFekYsT0FBTyxZQUFZLENBQUM7QUFDeEIsQ0FBQyxDQUFDO0FBRUYsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLE9BQW1DLEVBQVUsRUFBRSxDQUMvRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFO0lBQzFCLE1BQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QyxNQUFNLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLElBQUksUUFBUSxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFckUsT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDL0UsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRVgsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLGtCQUEyQyxFQUFnQixFQUFFO0lBQ3BGLE1BQU0sS0FBSyxHQUE2QixDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDakUsTUFBTSxpQkFBaUIsR0FBRyxFQUFrQixDQUFDO0lBRTdDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDakIsTUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFakQsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUVoRixDQUFDLENBQUMsYUFBYSxDQUE4QixZQUFvQixFQUFFLENBQUMsR0FBVyxFQUFFLEtBQWlDLEVBQUUsRUFBRTtZQUNsSCxNQUFNLFVBQVUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRW5FLElBQUksS0FBSyxFQUFFO2dCQUNQLGlCQUFpQixDQUFDLElBQUksQ0FBQztvQkFDbkIsSUFBSSxFQUFFLEdBQUcsVUFBVSxHQUFHLFVBQVUsRUFBRTtvQkFDbEMsVUFBVSxFQUFFO3dCQUNSLE1BQU0sRUFBRTs0QkFDSixXQUFXLEVBQUUsVUFBVTt5QkFDMUI7cUJBQ0o7b0JBQ0QsUUFBUSxFQUFFLDBCQUEwQixDQUFDLEtBQUssQ0FBQztpQkFDOUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxpQkFBaUIsQ0FBQztBQUM3QixDQUFDLENBQUM7QUFFRixNQUFNLGVBQWUsR0FBRyxDQUFDLGtCQUE0QyxFQUFFLEVBQUU7SUFDckUsT0FBTyxDQUFDLFFBQXNCLEVBQUUsRUFBRTtRQUM5QixJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFBRSxPQUFPLFFBQVEsQ0FBQztTQUFFO1FBRTdDLE1BQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sZ0JBQWdCLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFakUsUUFBUSxDQUFDLElBQUksQ0FBQztZQUNWLElBQUksRUFBRSxjQUFjO1lBQ3BCLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osY0FBYztvQkFDZCxnQkFBZ0I7aUJBQ25CO2FBQ0o7WUFDRCxRQUFRLEVBQUUsaUJBQWlCLENBQUMsa0JBQWtCLENBQUM7U0FDbEQsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxhQUFhLEdBQUcsQ0FBQyxZQUFvQixFQUFFLEVBQUU7SUFDM0MsT0FBTyxDQUFDLFFBQXNCLEVBQUUsRUFBRTtRQUM5QixJQUFJLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDcEQsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDVixJQUFJLEVBQUUsU0FBUztnQkFDZixVQUFVLEVBQUU7b0JBQ1IsTUFBTSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxNQUFNO3FCQUNqQjtpQkFDSjthQUNKLENBQUMsQ0FBQztTQUNOO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQUcsR0FBRyxFQUFFO0lBQ3BCLE9BQU8sQ0FBQyxRQUFzQixFQUFFLEVBQUU7UUFDOUIsUUFBUSxDQUFDLElBQUksQ0FBQztZQUNWLElBQUksRUFBRSxTQUFTO1lBQ2YsUUFBUSxFQUFFLENBQUM7b0JBQ1AsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLFVBQVUsRUFBRTt3QkFDUixNQUFNLEVBQUU7NEJBQ0osWUFBWSxFQUFFLENBQUM7eUJBQ2xCO3FCQUNKO2lCQUNKLENBQUM7U0FDTCxDQUFDLENBQUM7UUFDSCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDLENBQUE7QUFDTCxDQUFDLENBQUE7QUFFRCxNQUFNLGdCQUFnQixHQUFHLENBQUMsSUFBZ0IsRUFBRSxFQUFFO0lBQzFDLE9BQU8sQ0FBQyxRQUFzQixFQUFFLEVBQUU7UUFDOUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQVksRUFBRSxHQUFhLEVBQUUsRUFBRTtZQUMzRCxJQUFJLEdBQUcsQ0FBQyxZQUFZLElBQUksR0FBRyxDQUFDLFlBQVksR0FBRyxJQUFJLEVBQUU7Z0JBQzdDLE9BQU8sR0FBRyxDQUFDLFlBQVksQ0FBQzthQUMzQjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVOLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDVixJQUFJLEVBQUUsZUFBZTtZQUNyQixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLFlBQVksRUFBRSxFQUFFO29CQUNoQixnQkFBZ0IsRUFBRSxFQUFFO29CQUNwQixlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVM7aUJBQ3ZEO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFDSCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDLENBQUE7QUFDTCxDQUFDLENBQUE7QUFFRCxNQUFNLGdCQUFnQixHQUF1QjtJQUN6QyxXQUFXLENBQUMsTUFJWDtRQUNHLE1BQU0sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNuRCxNQUFNLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFFdEYsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUM1QixNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQztRQUNoQyxNQUFNLFdBQVcsR0FBRyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVoSSxNQUFNLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxPQUFPLENBQ3JDLFVBQVUsRUFBRSxFQUNaLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUN0QixVQUFVLENBQUMsT0FBTyxDQUFDLEVBQ25CLFlBQVksQ0FBQyxJQUFJLEVBQUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxFQUNwQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQzFCLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFDdkIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUN2QixlQUFlLENBQUMsa0JBQWtCLENBQUMsRUFDbkMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUM5QixDQUFDO1FBRUYsTUFBTSxRQUFRLEdBQUcsdUJBQXVCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFN0MsT0FBTztZQUNILElBQUksRUFBRSxXQUFXO1lBQ2pCLFVBQVUsRUFBRTtnQkFDUixrQkFBa0IsRUFBQyxDQUFDO3dCQUNoQixNQUFNLEVBQUUsUUFBUTt3QkFDaEIsR0FBRyxFQUFFOzRCQUNELENBQUMsRUFBRSxxRUFBcUU7eUJBQzNFO3FCQUNKLENBQUM7Z0JBQ0YsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSwyREFBMkQ7aUJBQ3JFO2FBQ0o7WUFDRCxRQUFRO1NBQ1gsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxnQkFBZ0IsQ0FBQyJ9
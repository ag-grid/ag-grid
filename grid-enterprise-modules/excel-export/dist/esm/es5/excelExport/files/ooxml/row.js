var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { getExcelColumnName } from '../../assets/excelUtils';
import cellFactory from './cell';
var addEmptyCells = function (cells, rowIdx) {
    var mergeMap = [];
    var posCounter = 0;
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
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
        for (var i = mergeMap.length - 1; i >= 0; i--) {
            var mergedCells = [];
            var cell = cells[mergeMap[i].pos];
            for (var j = 1; j <= cell.mergeAcross; j++) {
                mergedCells.push({
                    ref: "" + getExcelColumnName(mergeMap[i].excelPos + 1 + j) + (rowIdx + 1),
                    styleId: cell.styleId,
                    data: { type: 'empty', value: null }
                });
            }
            if (mergedCells.length) {
                cells.splice.apply(cells, __spreadArray([mergeMap[i].pos + 1, 0], __read(mergedCells)));
            }
        }
    }
};
var shouldDisplayCell = function (cell) { var _a; return ((_a = cell.data) === null || _a === void 0 ? void 0 : _a.value) !== '' || cell.styleId !== undefined; };
var rowFactory = {
    getTemplate: function (config, idx, currentSheet) {
        var collapsed = config.collapsed, hidden = config.hidden, height = config.height, outlineLevel = config.outlineLevel, _a = config.cells, cells = _a === void 0 ? [] : _a;
        addEmptyCells(cells, idx);
        var children = cells.filter(shouldDisplayCell).map(function (cell, idx) { return cellFactory.getTemplate(cell, idx, currentSheet); });
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
            children: children
        };
    }
};
export default rowFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3Jvdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM3RCxPQUFPLFdBQVcsTUFBTSxRQUFRLENBQUM7QUFFakMsSUFBTSxhQUFhLEdBQUcsVUFBQyxLQUFrQixFQUFFLE1BQWM7SUFDckQsSUFBTSxRQUFRLEdBQXdDLEVBQUUsQ0FBQztJQUN6RCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbkMsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUNWLEdBQUcsRUFBRSxDQUFDO2dCQUNOLFFBQVEsRUFBRSxVQUFVO2FBQ3ZCLENBQUMsQ0FBQztZQUNILFVBQVUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO1NBQ2xDO1FBQ0QsVUFBVSxFQUFFLENBQUM7S0FDaEI7SUFFRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7UUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzNDLElBQU0sV0FBVyxHQUFnQixFQUFFLENBQUM7WUFDcEMsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDekMsV0FBVyxDQUFDLElBQUksQ0FBQztvQkFDYixHQUFHLEVBQUUsS0FBRyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBRyxNQUFNLEdBQUcsQ0FBQyxDQUFFO29CQUN2RSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87b0JBQ3JCLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtpQkFDdkMsQ0FBQyxDQUFDO2FBQ047WUFDRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BCLEtBQUssQ0FBQyxNQUFNLE9BQVosS0FBSyxpQkFBUSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQUssV0FBVyxJQUFFO2FBQ3hEO1NBRUo7S0FDSjtBQUNMLENBQUMsQ0FBQztBQUVGLElBQU0saUJBQWlCLEdBQUcsVUFBQyxJQUFlLFlBQUssT0FBQSxDQUFBLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsS0FBSyxNQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQSxFQUFBLENBQUM7QUFFckcsSUFBTSxVQUFVLEdBQXVCO0lBQ25DLFdBQVcsRUFBWCxVQUFZLE1BQWdCLEVBQUUsR0FBVyxFQUFFLFlBQW9CO1FBQ25ELElBQUEsU0FBUyxHQUErQyxNQUFNLFVBQXJELEVBQUUsTUFBTSxHQUF1QyxNQUFNLE9BQTdDLEVBQUUsTUFBTSxHQUErQixNQUFNLE9BQXJDLEVBQUUsWUFBWSxHQUFpQixNQUFNLGFBQXZCLEVBQUUsS0FBZSxNQUFNLE1BQVgsRUFBVixLQUFLLG1CQUFHLEVBQUUsS0FBQSxDQUFZO1FBQ3ZFLGFBQWEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUksRUFBRSxHQUFHLElBQUssT0FBQSxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLEVBQWhELENBQWdELENBQUMsQ0FBQztRQUV0SCxPQUFPO1lBQ0gsSUFBSSxFQUFFLEtBQUs7WUFDWCxVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztvQkFDVixTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUc7b0JBQ2hDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRztvQkFDMUIsRUFBRSxFQUFFLE1BQU07b0JBQ1YsWUFBWSxFQUFFLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRztvQkFDeEMsS0FBSyxFQUFFLEtBQUs7b0JBQ1osWUFBWSxFQUFFLFlBQVksSUFBSSxTQUFTO2lCQUMxQzthQUNKO1lBQ0QsUUFBUSxVQUFBO1NBQ1gsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxVQUFVLENBQUMifQ==
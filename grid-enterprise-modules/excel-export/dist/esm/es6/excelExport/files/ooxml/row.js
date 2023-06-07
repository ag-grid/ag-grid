import { getExcelColumnName } from '../../assets/excelUtils';
import cellFactory from './cell';
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
export default rowFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3Jvdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM3RCxPQUFPLFdBQVcsTUFBTSxRQUFRLENBQUM7QUFFakMsTUFBTSxhQUFhLEdBQUcsQ0FBQyxLQUFrQixFQUFFLE1BQWMsRUFBUSxFQUFFO0lBQy9ELE1BQU0sUUFBUSxHQUF3QyxFQUFFLENBQUM7SUFDekQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ25DLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDVixHQUFHLEVBQUUsQ0FBQztnQkFDTixRQUFRLEVBQUUsVUFBVTthQUN2QixDQUFDLENBQUM7WUFDSCxVQUFVLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQztTQUNsQztRQUNELFVBQVUsRUFBRSxDQUFDO0tBQ2hCO0lBRUQsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO1FBQ2pCLEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxNQUFNLFdBQVcsR0FBZ0IsRUFBRSxDQUFDO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pDLFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ2IsR0FBRyxFQUFFLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDdkUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNyQixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7aUJBQ3ZDLENBQUMsQ0FBQzthQUNOO1lBQ0QsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUNwQixLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLFdBQVcsQ0FBQyxDQUFDO2FBQ3hEO1NBRUo7S0FDSjtBQUNMLENBQUMsQ0FBQztBQUVGLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxJQUFlLEVBQUUsRUFBRSxXQUFDLE9BQUEsQ0FBQSxNQUFBLElBQUksQ0FBQyxJQUFJLDBDQUFFLEtBQUssTUFBSyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUEsRUFBQSxDQUFDO0FBRXJHLE1BQU0sVUFBVSxHQUF1QjtJQUNuQyxXQUFXLENBQUMsTUFBZ0IsRUFBRSxHQUFXLEVBQUUsWUFBb0I7UUFDM0QsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEdBQUcsRUFBRSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQ3ZFLGFBQWEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUIsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBRXRILE9BQU87WUFDSCxJQUFJLEVBQUUsS0FBSztZQUNYLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO29CQUNWLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRztvQkFDaEMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHO29CQUMxQixFQUFFLEVBQUUsTUFBTTtvQkFDVixZQUFZLEVBQUUsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHO29CQUN4QyxLQUFLLEVBQUUsS0FBSztvQkFDWixZQUFZLEVBQUUsWUFBWSxJQUFJLFNBQVM7aUJBQzFDO2FBQ0o7WUFDRCxRQUFRO1NBQ1gsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxVQUFVLENBQUMifQ==
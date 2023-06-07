import { BaseManager } from './baseManager';
export class ChartEventManager extends BaseManager {
    legendItemClick(series, itemId, enabled) {
        const event = {
            type: 'legend-item-click',
            series,
            itemId,
            enabled,
        };
        this.listeners.dispatch('legend-item-click', event);
    }
    legendItemDoubleClick(series, itemId, enabled, numVisibleItems) {
        const event = {
            type: 'legend-item-double-click',
            series,
            itemId,
            enabled,
            numVisibleItems,
        };
        this.listeners.dispatch('legend-item-double-click', event);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRFdmVudE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvaW50ZXJhY3Rpb24vY2hhcnRFdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQXNCNUMsTUFBTSxPQUFPLGlCQUFrQixTQUFRLFdBQXdDO0lBQzNFLGVBQWUsQ0FBQyxNQUFXLEVBQUUsTUFBVyxFQUFFLE9BQWdCO1FBQ3RELE1BQU0sS0FBSyxHQUE4QjtZQUNyQyxJQUFJLEVBQUUsbUJBQW1CO1lBQ3pCLE1BQU07WUFDTixNQUFNO1lBQ04sT0FBTztTQUNWLENBQUM7UUFFRixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQscUJBQXFCLENBQUMsTUFBVyxFQUFFLE1BQVcsRUFBRSxPQUFnQixFQUFFLGVBQTBDO1FBQ3hHLE1BQU0sS0FBSyxHQUFvQztZQUMzQyxJQUFJLEVBQUUsMEJBQTBCO1lBQ2hDLE1BQU07WUFDTixNQUFNO1lBQ04sT0FBTztZQUNQLGVBQWU7U0FDbEIsQ0FBQztRQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9ELENBQUM7Q0FDSiJ9
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, BeanStub, RowNode, Events, _ } from "@ag-grid-community/core";
export class DetailCellRendererCtrl extends BeanStub {
    constructor() {
        super(...arguments);
        this.loadRowDataVersion = 0;
        this.needRefresh = false;
    }
    init(comp, params) {
        this.params = params;
        this.comp = comp;
        const doNothingBecauseInsidePinnedSection = params.pinned != null;
        if (doNothingBecauseInsidePinnedSection) {
            return;
        }
        this.setAutoHeightClasses();
        this.setupRefreshStrategy();
        this.addThemeToDetailGrid();
        this.createDetailGrid();
        this.loadRowData();
        this.addManagedListener(params.node.parent, RowNode.EVENT_DATA_CHANGED, () => {
            this.needRefresh = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_FULL_WIDTH_ROW_FOCUSED, this.onFullWidthRowFocused.bind(this));
    }
    onFullWidthRowFocused(e) {
        const params = this.params;
        const row = { rowIndex: params.node.rowIndex, rowPinned: params.node.rowPinned };
        const eventRow = { rowIndex: e.rowIndex, rowPinned: e.rowPinned };
        const isSameRow = this.rowPositionUtils.sameRow(row, eventRow);
        if (!isSameRow) {
            return;
        }
        this.focusService.focusInto(this.comp.getGui(), e.fromBelow);
    }
    setAutoHeightClasses() {
        const autoHeight = this.gridOptionsService.is('detailRowAutoHeight');
        const parentClass = autoHeight ? 'ag-details-row-auto-height' : 'ag-details-row-fixed-height';
        const detailClass = autoHeight ? 'ag-details-grid-auto-height' : 'ag-details-grid-fixed-height';
        this.comp.addOrRemoveCssClass(parentClass, true);
        this.comp.addOrRemoveDetailGridCssClass(detailClass, true);
    }
    setupRefreshStrategy() {
        const providedStrategy = this.params.refreshStrategy;
        const validSelection = providedStrategy == 'everything' || providedStrategy == 'nothing' || providedStrategy == 'rows';
        if (validSelection) {
            this.refreshStrategy = providedStrategy;
            return;
        }
        if (providedStrategy != null) {
            console.warn("AG Grid: invalid cellRendererParams.refreshStrategy = '" + providedStrategy +
                "' supplied, defaulting to refreshStrategy = 'rows'.");
        }
        this.refreshStrategy = 'rows';
    }
    addThemeToDetailGrid() {
        // this is needed by environment service of the child grid, the class needs to be on
        // the grid div itself - the browser's CSS on the other hand just inherits from the parent grid theme.
        const { theme } = this.environment.getTheme();
        if (theme) {
            this.comp.addOrRemoveDetailGridCssClass(theme, true);
        }
    }
    createDetailGrid() {
        if (_.missing(this.params.detailGridOptions)) {
            console.warn('AG Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
            return;
        }
        const autoHeight = this.gridOptionsService.is('detailRowAutoHeight');
        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions
        const gridOptions = Object.assign({}, this.params.detailGridOptions);
        if (autoHeight) {
            gridOptions.domLayout = 'autoHeight';
        }
        this.comp.setDetailGrid(gridOptions);
    }
    registerDetailWithMaster(api, columnApi) {
        const rowId = this.params.node.id;
        const masterGridApi = this.params.api;
        const gridInfo = {
            id: rowId,
            api: api,
            columnApi: columnApi
        };
        const rowNode = this.params.node;
        // register with api
        masterGridApi.addDetailGridInfo(rowId, gridInfo);
        // register with node
        rowNode.detailGridInfo = gridInfo;
        this.addDestroyFunc(() => {
            // the gridInfo can be stale if a refresh happens and
            // a new row is created before the old one is destroyed.
            if (rowNode.detailGridInfo !== gridInfo) {
                return;
            }
            masterGridApi.removeDetailGridInfo(rowId); // unregister from api
            rowNode.detailGridInfo = null; // unregister from node
        });
    }
    loadRowData() {
        // in case a refresh happens before the last refresh completes (as we depend on async
        // application logic) we keep track on what the latest call was.
        this.loadRowDataVersion++;
        const versionThisCall = this.loadRowDataVersion;
        const userFunc = this.params.getDetailRowData;
        if (!userFunc) {
            console.warn('AG Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }
        const successCallback = (rowData) => {
            const mostRecentCall = this.loadRowDataVersion === versionThisCall;
            if (mostRecentCall) {
                this.comp.setRowData(rowData);
            }
        };
        const funcParams = {
            node: this.params.node,
            // we take data from node, rather than params.data
            // as the data could have been updated with new instance
            data: this.params.node.data,
            successCallback: successCallback,
            context: this.gridOptionsService.context
        };
        userFunc(funcParams);
    }
    refresh() {
        const GET_GRID_TO_REFRESH = false;
        const GET_GRID_TO_DO_NOTHING = true;
        // if we return true, it means we pretend to the grid
        // that we have refreshed, so refresh will never happen.
        const doNotRefresh = !this.needRefresh || this.refreshStrategy === 'nothing';
        if (doNotRefresh) {
            // we do nothing in this refresh method, and also tell the grid to do nothing
            return GET_GRID_TO_DO_NOTHING;
        }
        // reset flag, so don't refresh again until more data changes.
        this.needRefresh = false;
        if (this.refreshStrategy === 'everything') {
            // we want full refresh, so tell the grid to destroy and recreate this cell
            return GET_GRID_TO_REFRESH;
        }
        else {
            // do the refresh here, and tell the grid to do nothing
            this.loadRowData();
            return GET_GRID_TO_DO_NOTHING;
        }
    }
}
__decorate([
    Autowired('rowPositionUtils')
], DetailCellRendererCtrl.prototype, "rowPositionUtils", void 0);
__decorate([
    Autowired('focusService')
], DetailCellRendererCtrl.prototype, "focusService", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0YWlsQ2VsbFJlbmRlcmVyQ3RybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYXN0ZXJEZXRhaWwvZGV0YWlsQ2VsbFJlbmRlcmVyQ3RybC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULFFBQVEsRUFLUixPQUFPLEVBR1AsTUFBTSxFQUlOLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE1BQU0sT0FBTyxzQkFBdUIsU0FBUSxRQUFRO0lBQXBEOztRQVNZLHVCQUFrQixHQUFHLENBQUMsQ0FBQztRQUV2QixnQkFBVyxHQUFHLEtBQUssQ0FBQztJQStLaEMsQ0FBQztJQTNLVSxJQUFJLENBQUMsSUFBeUIsRUFBRSxNQUFpQztRQUNwRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixNQUFNLG1DQUFtQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDO1FBQ2xFLElBQUksbUNBQW1DLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFcEQsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRW5CLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU8sRUFBRSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1lBQzFFLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzSCxDQUFDO0lBRU8scUJBQXFCLENBQUMsQ0FBMkI7UUFDckQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMzQixNQUFNLEdBQUcsR0FBRyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFVLEVBQUUsQ0FBQztRQUNuRixNQUFNLFFBQVEsR0FBRyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBVSxFQUFFLENBQUM7UUFDcEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFL0QsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUUzQixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU8sb0JBQW9CO1FBQ3hCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUVyRSxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQztRQUM5RixNQUFNLFdBQVcsR0FBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQztRQUVqRyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRU8sb0JBQW9CO1FBQ3hCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFFckQsTUFBTSxjQUFjLEdBQUcsZ0JBQWdCLElBQUksWUFBWSxJQUFJLGdCQUFnQixJQUFJLFNBQVMsSUFBSSxnQkFBZ0IsSUFBSSxNQUFNLENBQUM7UUFDdkgsSUFBSSxjQUFjLEVBQUU7WUFDaEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxnQkFBZ0IsQ0FBQztZQUN4QyxPQUFPO1NBQ1Y7UUFFRCxJQUFJLGdCQUFnQixJQUFFLElBQUksRUFBRTtZQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLHlEQUF5RCxHQUFHLGdCQUFnQjtnQkFDckYscURBQXFELENBQUMsQ0FBQztTQUM5RDtRQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO0lBQ2xDLENBQUM7SUFFTyxvQkFBb0I7UUFDeEIsb0ZBQW9GO1FBQ3BGLHNHQUFzRztRQUN0RyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM5QyxJQUFJLEtBQUssRUFBRTtZQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3hEO0lBQ0wsQ0FBQztJQUVPLGdCQUFnQjtRQUNwQixJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUVBQWlFO2dCQUMxRSxtRUFBbUUsQ0FBQyxDQUFDO1lBQ3pFLE9BQU87U0FDVjtRQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUVyRSxvRUFBb0U7UUFDcEUsb0VBQW9FO1FBQ3BFLHFDQUFxQztRQUNyQyxNQUFNLFdBQVcscUJBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRXZELElBQUksVUFBVSxFQUFFO1lBQ1osV0FBVyxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7U0FDeEM7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU0sd0JBQXdCLENBQUMsR0FBWSxFQUFFLFNBQW9CO1FBQzlELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUcsQ0FBQztRQUNuQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUV0QyxNQUFNLFFBQVEsR0FBbUI7WUFDN0IsRUFBRSxFQUFFLEtBQUs7WUFDVCxHQUFHLEVBQUUsR0FBRztZQUNSLFNBQVMsRUFBRSxTQUFTO1NBQ3ZCLENBQUM7UUFFRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQWUsQ0FBQztRQUU1QyxvQkFBb0I7UUFDcEIsYUFBYSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVqRCxxQkFBcUI7UUFDckIsT0FBTyxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7UUFFbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUU7WUFDckIscURBQXFEO1lBQ3JELHdEQUF3RDtZQUN4RCxJQUFJLE9BQU8sQ0FBQyxjQUFjLEtBQUssUUFBUSxFQUFFO2dCQUFFLE9BQU87YUFBRTtZQUNwRCxhQUFhLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7WUFDakUsT0FBTyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsQ0FBQyx1QkFBdUI7UUFDMUQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sV0FBVztRQUVmLHFGQUFxRjtRQUNyRixnRUFBZ0U7UUFDaEUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBRWhELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFDOUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0VBQWdFO2dCQUN6RSxrRUFBa0UsQ0FBQyxDQUFDO1lBQ3hFLE9BQU87U0FDVjtRQUVELE1BQU0sZUFBZSxHQUFHLENBQUMsT0FBYyxFQUFFLEVBQUU7WUFDdkMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixLQUFLLGVBQWUsQ0FBQztZQUNuRSxJQUFJLGNBQWMsRUFBRTtnQkFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDakM7UUFDTCxDQUFDLENBQUM7UUFFRixNQUFNLFVBQVUsR0FBUTtZQUNwQixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQ3RCLGtEQUFrRDtZQUNsRCx3REFBd0Q7WUFDeEQsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUk7WUFDM0IsZUFBZSxFQUFFLGVBQWU7WUFDaEMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPO1NBQzNDLENBQUM7UUFDRixRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVNLE9BQU87UUFDVixNQUFNLG1CQUFtQixHQUFHLEtBQUssQ0FBQztRQUNsQyxNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQztRQUVwQyxxREFBcUQ7UUFDckQsd0RBQXdEO1FBQ3hELE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQztRQUM3RSxJQUFJLFlBQVksRUFBRTtZQUNkLDZFQUE2RTtZQUM3RSxPQUFPLHNCQUFzQixDQUFDO1NBQ2pDO1FBRUQsOERBQThEO1FBQzlELElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBRXpCLElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxZQUFZLEVBQUU7WUFDdkMsMkVBQTJFO1lBQzNFLE9BQU8sbUJBQW1CLENBQUM7U0FDOUI7YUFBTTtZQUNILHVEQUF1RDtZQUN2RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsT0FBTyxzQkFBc0IsQ0FBQztTQUNqQztJQUNMLENBQUM7Q0FDSjtBQXhMa0M7SUFBOUIsU0FBUyxDQUFDLGtCQUFrQixDQUFDO2dFQUFxRDtBQUN4RDtJQUExQixTQUFTLENBQUMsY0FBYyxDQUFDOzREQUE2QyJ9
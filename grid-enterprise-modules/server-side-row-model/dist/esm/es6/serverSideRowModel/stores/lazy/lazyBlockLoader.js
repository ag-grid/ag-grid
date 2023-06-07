var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub, Autowired, PostConstruct, RowNodeBlockLoader } from "@ag-grid-community/core";
export class LazyBlockLoader extends BeanStub {
    constructor(cache, parentNode, storeParams) {
        super();
        this.loadingNodes = new Set();
        this.checkForLoadQueued = false;
        this.loaderTimeout = undefined;
        this.nextBlockToLoad = undefined;
        this.parentNode = parentNode;
        this.cache = cache;
        this.storeParams = storeParams;
    }
    init() {
        this.addManagedListener(this.rowNodeBlockLoader, RowNodeBlockLoader.BLOCK_LOADED_EVENT, () => this.queueLoadAction());
    }
    isRowLoading(index) {
        return this.loadingNodes.has(index);
    }
    getBlockToLoad() {
        var _a;
        const firstRowInViewport = this.api.getFirstDisplayedRow();
        const lastRowInViewport = this.api.getLastDisplayedRow();
        // quick look-up for priority rows needing loading in viewport.
        for (let i = firstRowInViewport; i <= lastRowInViewport; i++) {
            const node = this.cache.getNodeCachedByDisplayIndex(i);
            if (!node) {
                // if no row details, ignore, as row hasn't been created
                // and it's too expensive to work out its location here
                continue;
            }
            const lazyNode = this.cache.getNodes().getBy('node', node);
            if (!lazyNode) {
                continue;
            }
            if (this.isRowLoading(lazyNode.index)) {
                continue;
            }
            if (node.__needsRefreshWhenVisible || (node.stub && !node.failedLoad)) {
                return this.getBlockStartIndexForIndex(lazyNode.index);
            }
        }
        const nodesToRefresh = this.cache.getNodesToRefresh();
        let nodeToRefresh = null;
        let nodeToRefreshDist = Number.MAX_SAFE_INTEGER;
        nodesToRefresh.forEach(node => {
            if (node.rowIndex == null) {
                nodeToRefresh = node;
                return;
            }
            const distToViewportTop = Math.abs(firstRowInViewport - node.rowIndex);
            const distToViewportBottom = Math.abs(node.rowIndex - lastRowInViewport);
            if (distToViewportTop < nodeToRefreshDist) {
                nodeToRefresh = node;
                nodeToRefreshDist = distToViewportTop;
            }
            if (distToViewportBottom < nodeToRefreshDist) {
                nodeToRefresh = node;
                nodeToRefreshDist = distToViewportBottom;
            }
        });
        const lazyIndex = (_a = this.cache.getNodes().getBy('node', nodeToRefresh)) === null || _a === void 0 ? void 0 : _a.index;
        return lazyIndex == null ? undefined : this.getBlockStartIndexForIndex(lazyIndex);
    }
    reset() {
        this.loadingNodes.clear();
        clearTimeout(this.loaderTimeout);
        this.loaderTimeout = undefined;
    }
    executeLoad(startRow, endRow) {
        var _a;
        const ssrmParams = this.cache.getSsrmParams();
        const request = {
            startRow,
            endRow,
            rowGroupCols: ssrmParams.rowGroupCols,
            valueCols: ssrmParams.valueCols,
            pivotCols: ssrmParams.pivotCols,
            pivotMode: ssrmParams.pivotMode,
            groupKeys: this.parentNode.getGroupKeys(),
            filterModel: ssrmParams.filterModel,
            sortModel: ssrmParams.sortModel,
        };
        const removeNodesFromLoadingMap = () => {
            for (let i = 0; i < endRow - startRow; i++) {
                this.loadingNodes.delete(startRow + i);
            }
        };
        const addNodesToLoadingMap = () => {
            for (let i = 0; i < endRow - startRow; i++) {
                this.loadingNodes.add(startRow + i);
            }
        };
        const success = (params) => {
            this.rowNodeBlockLoader.loadComplete();
            this.cache.onLoadSuccess(startRow, endRow - startRow, params);
            removeNodesFromLoadingMap();
            this.queueLoadAction();
        };
        const fail = () => {
            this.rowNodeBlockLoader.loadComplete();
            this.cache.onLoadFailed(startRow, endRow - startRow);
            removeNodesFromLoadingMap();
            this.queueLoadAction();
        };
        const params = {
            request,
            successCallback: (rowData, rowCount) => success({ rowData, rowCount }),
            success,
            failCallback: fail,
            fail,
            parentNode: this.parentNode,
            api: this.api,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        };
        addNodesToLoadingMap();
        (_a = this.cache.getSsrmParams().datasource) === null || _a === void 0 ? void 0 : _a.getRows(params);
    }
    getNextBlockToLoad() {
        const result = this.getBlockToLoad();
        if (result != null && result < 0) {
            this.getBlockToLoad();
        }
        if (result != null) {
            return [String(result), result + this.getBlockSize()];
        }
        return null;
    }
    queueLoadCheck() {
        // already going to check next cycle, ignore.
        if (this.checkForLoadQueued) {
            return;
        }
        this.checkForLoadQueued = true;
        window.queueMicrotask(() => {
            this.checkForLoadQueued = false;
            this.queueLoadAction();
        });
    }
    queueLoadAction() {
        var _a;
        const nextBlockToLoad = this.getNextBlockToLoad();
        if (!nextBlockToLoad) {
            // there's no block we should be loading right now, clear the timeouts
            window.clearTimeout(this.loaderTimeout);
            this.loaderTimeout = undefined;
            this.nextBlockToLoad = undefined;
            return;
        }
        // if the next required block has changed, reset the loading timeout
        if (!this.nextBlockToLoad || (this.nextBlockToLoad[0] !== nextBlockToLoad[0] && this.nextBlockToLoad[1] !== nextBlockToLoad[1])) {
            this.nextBlockToLoad = nextBlockToLoad;
            window.clearTimeout(this.loaderTimeout);
            const [startRowString, endRow] = this.nextBlockToLoad;
            const startRow = Number(startRowString);
            this.loaderTimeout = window.setTimeout(() => {
                if (!this.cache.isAlive()) {
                    return;
                }
                this.loaderTimeout = undefined;
                this.attemptLoad(startRow, endRow);
                this.nextBlockToLoad = undefined;
            }, (_a = this.gridOptionsService.getNum('blockLoadDebounceMillis')) !== null && _a !== void 0 ? _a : 0);
        }
    }
    attemptLoad(start, end) {
        const availableLoadingCount = this.rowNodeBlockLoader.getAvailableLoadingCount();
        // too many loads already, ignore the request as a successful request will requeue itself anyway
        if (availableLoadingCount != null && availableLoadingCount === 0) {
            return;
        }
        this.rowNodeBlockLoader.registerLoads(1);
        this.executeLoad(start, end);
        this.queueLoadAction();
    }
    getBlockSize() {
        return this.storeParams.cacheBlockSize || LazyBlockLoader.DEFAULT_BLOCK_SIZE;
    }
    getBlockStartIndexForIndex(storeIndex) {
        const blockSize = this.getBlockSize();
        return storeIndex - (storeIndex % blockSize);
    }
    getBlockBoundsForIndex(storeIndex) {
        const startOfBlock = this.getBlockStartIndexForIndex(storeIndex);
        const blockSize = this.getBlockSize();
        return [startOfBlock, startOfBlock + blockSize];
    }
}
LazyBlockLoader.DEFAULT_BLOCK_SIZE = 100;
__decorate([
    Autowired('gridApi')
], LazyBlockLoader.prototype, "api", void 0);
__decorate([
    Autowired('columnApi')
], LazyBlockLoader.prototype, "columnApi", void 0);
__decorate([
    Autowired('rowNodeBlockLoader')
], LazyBlockLoader.prototype, "rowNodeBlockLoader", void 0);
__decorate([
    PostConstruct
], LazyBlockLoader.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eUJsb2NrTG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zdG9yZXMvbGF6eS9sYXp5QmxvY2tMb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQXVGLGFBQWEsRUFBRSxrQkFBa0IsRUFBaUQsTUFBTSx5QkFBeUIsQ0FBQztBQUdyTyxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxRQUFRO0lBbUJ6QyxZQUFZLEtBQWdCLEVBQUUsVUFBbUIsRUFBRSxXQUF1QztRQUN0RixLQUFLLEVBQUUsQ0FBQztRQVpKLGlCQUFZLEdBQWdCLElBQUksR0FBRyxFQUFFLENBQUM7UUFLdEMsdUJBQWtCLEdBQVksS0FBSyxDQUFDO1FBQ3BDLGtCQUFhLEdBQXVCLFNBQVMsQ0FBQztRQUM5QyxvQkFBZSxHQUFpQyxTQUFTLENBQUM7UUFNOUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7SUFDbkMsQ0FBQztJQUdPLElBQUk7UUFDUixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLGtCQUFrQixDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO0lBQzFILENBQUM7SUFFTSxZQUFZLENBQUMsS0FBYTtRQUM3QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFTyxjQUFjOztRQUNsQixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUMzRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUV6RCwrREFBK0Q7UUFDL0QsS0FBSSxJQUFJLENBQUMsR0FBRyxrQkFBa0IsRUFBRSxDQUFDLElBQUksaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV2RCxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNQLHdEQUF3RDtnQkFDeEQsdURBQXVEO2dCQUN2RCxTQUFTO2FBQ1o7WUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDWCxTQUFTO2FBQ1o7WUFFRCxJQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNsQyxTQUFTO2FBQ1o7WUFFRCxJQUFJLElBQUksQ0FBQyx5QkFBeUIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ25FLE9BQU8sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMxRDtTQUNKO1FBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3RELElBQUksYUFBYSxHQUFtQixJQUFJLENBQUM7UUFDekMsSUFBSSxpQkFBaUIsR0FBVyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFDeEQsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMxQixJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUN2QixhQUFhLEdBQUcsSUFBSSxDQUFDO2dCQUNyQixPQUFPO2FBQ1Y7WUFDRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLGlCQUFpQixDQUFDLENBQUM7WUFDekUsSUFBSSxpQkFBaUIsR0FBRyxpQkFBaUIsRUFBRTtnQkFDdkMsYUFBYSxHQUFHLElBQUksQ0FBQztnQkFDckIsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7YUFDekM7WUFFRCxJQUFJLG9CQUFvQixHQUFHLGlCQUFpQixFQUFFO2dCQUMxQyxhQUFhLEdBQUcsSUFBSSxDQUFDO2dCQUNyQixpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQzthQUM1QztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxTQUFTLEdBQUcsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLDBDQUFFLEtBQUssQ0FBQztRQUM1RSxPQUFPLFNBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFTSxLQUFLO1FBQ1IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQixZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO0lBQ25DLENBQUM7SUFFTyxXQUFXLENBQUMsUUFBZ0IsRUFBRSxNQUFjOztRQUNoRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUE4QjtZQUN2QyxRQUFRO1lBQ1IsTUFBTTtZQUNOLFlBQVksRUFBRSxVQUFVLENBQUMsWUFBWTtZQUNyQyxTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVM7WUFDL0IsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTO1lBQy9CLFNBQVMsRUFBRSxVQUFVLENBQUMsU0FBUztZQUMvQixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUU7WUFDekMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXO1lBQ25DLFNBQVMsRUFBRSxVQUFVLENBQUMsU0FBUztTQUNsQyxDQUFDO1FBRUYsTUFBTSx5QkFBeUIsR0FBRyxHQUFHLEVBQUU7WUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sR0FBRyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUMxQztRQUNMLENBQUMsQ0FBQTtRQUVELE1BQU0sb0JBQW9CLEdBQUcsR0FBRyxFQUFFO1lBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEdBQUcsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDdkM7UUFDTCxDQUFDLENBQUE7UUFFRCxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQXlCLEVBQUUsRUFBRTtZQUMxQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLE1BQU0sR0FBRyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDOUQseUJBQXlCLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDM0IsQ0FBQyxDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFO1lBQ2QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUM7WUFDckQseUJBQXlCLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDM0IsQ0FBQyxDQUFBO1FBRUQsTUFBTSxNQUFNLEdBQTZCO1lBQ3JDLE9BQU87WUFDUCxlQUFlLEVBQUUsQ0FBQyxPQUFjLEVBQUUsUUFBZ0IsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO1lBQ3JGLE9BQU87WUFDUCxZQUFZLEVBQUUsSUFBSTtZQUNsQixJQUFJO1lBQ0osVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQzNCLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU87U0FDM0MsQ0FBQztRQUVGLG9CQUFvQixFQUFFLENBQUM7UUFDdkIsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDLFVBQVUsMENBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTyxrQkFBa0I7UUFDdEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUN6QjtRQUNELElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtZQUNoQixPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztTQUN6RDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxjQUFjO1FBQ2pCLDZDQUE2QztRQUM3QyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUN6QixPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7WUFDaEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLGVBQWU7O1FBQ2xCLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDbEIsc0VBQXNFO1lBQ3RFLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO1lBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1lBQ2pDLE9BQU87U0FDVjtRQUVELG9FQUFvRTtRQUNwRSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUssZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUssZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDN0gsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7WUFDdkMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFeEMsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQ3RELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDdkIsT0FBTztpQkFDVjtnQkFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1lBQ3JDLENBQUMsRUFBRSxNQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsbUNBQUksQ0FBQyxDQUFDLENBQUM7U0FDdEU7SUFDTCxDQUFDO0lBRU8sV0FBVyxDQUFDLEtBQWEsRUFBRSxHQUFXO1FBQzFDLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDakYsZ0dBQWdHO1FBQ2hHLElBQUkscUJBQXFCLElBQUksSUFBSSxJQUFJLHFCQUFxQixLQUFLLENBQUMsRUFBRTtZQUM5RCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTdCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBR00sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLElBQUksZUFBZSxDQUFDLGtCQUFrQixDQUFDO0lBQ2pGLENBQUM7SUFFTSwwQkFBMEIsQ0FBQyxVQUFrQjtRQUNoRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEMsT0FBTyxVQUFVLEdBQUcsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVNLHNCQUFzQixDQUFDLFVBQWtCO1FBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEMsT0FBTyxDQUFDLFlBQVksRUFBRSxZQUFZLEdBQUcsU0FBUyxDQUFDLENBQUM7SUFDcEQsQ0FBQzs7QUE3TmEsa0NBQWtCLEdBQUcsR0FBRyxDQUFDO0FBSmpCO0lBQXJCLFNBQVMsQ0FBQyxTQUFTLENBQUM7NENBQXNCO0FBQ25CO0lBQXZCLFNBQVMsQ0FBQyxXQUFXLENBQUM7a0RBQThCO0FBQ3BCO0lBQWhDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQzsyREFBZ0Q7QUF1QmhGO0lBREMsYUFBYTsyQ0FHYiJ9
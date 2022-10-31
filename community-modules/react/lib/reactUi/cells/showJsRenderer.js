// @ag-grid-community/react v28.2.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const beansContext_1 = require("../beansContext");
const useEffectOnce_1 = require("../useEffectOnce");
const useJsCellRenderer = (showDetails, showTools, eCellValue, cellValueVersion, jsCellRendererRef, eGui) => {
    const { context, userComponentFactory } = react_1.useContext(beansContext_1.BeansContext);
    const destroyCellRenderer = react_1.useCallback(() => {
        const comp = jsCellRendererRef.current;
        if (!comp) {
            return;
        }
        const compGui = comp.getGui();
        if (compGui && compGui.parentElement) {
            compGui.parentElement.removeChild(compGui);
        }
        context.destroyBean(comp);
        jsCellRendererRef.current = undefined;
    }, []);
    // create or refresh JS cell renderer
    react_1.useEffect(() => {
        const showValue = showDetails != null;
        const jsCompDetails = showDetails && showDetails.compDetails && !showDetails.compDetails.componentFromFramework;
        const waitingForToolsSetup = showTools && eCellValue == null;
        const showComp = showValue && jsCompDetails && !waitingForToolsSetup;
        // if not showing comp, destroy any existing one and return
        if (!showComp) {
            destroyCellRenderer();
            return;
        }
        const compDetails = showDetails.compDetails;
        if (jsCellRendererRef.current) {
            // attempt refresh if refresh method exists
            const comp = jsCellRendererRef.current;
            const attemptRefresh = comp.refresh != null && showDetails.force == false;
            const refreshResult = attemptRefresh ? comp.refresh(compDetails.params) : false;
            const refreshWorked = refreshResult === true || refreshResult === undefined;
            // if refresh worked, nothing else to do
            if (refreshWorked) {
                return;
            }
            // if refresh didn't work, we destroy it and continue, so new cell renderer created below
            destroyCellRenderer();
        }
        const promise = compDetails.newAgStackInstance();
        ;
        if (!promise) {
            return;
        }
        const comp = promise.resolveNow(null, x => x); // js comps are never async
        if (!comp) {
            return;
        }
        const compGui = comp.getGui();
        if (!compGui) {
            return;
        }
        const parent = showTools ? eCellValue : eGui.current;
        parent.appendChild(compGui);
        jsCellRendererRef.current = comp;
    }, [showDetails, showTools, cellValueVersion]);
    // this effect makes sure destroyCellRenderer gets called when the
    // component is destroyed. as the other effect only updates when there
    // is a change in state
    useEffectOnce_1.useEffectOnce(() => {
        return destroyCellRenderer;
    });
};
exports.default = useJsCellRenderer;

//# sourceMappingURL=showJsRenderer.js.map

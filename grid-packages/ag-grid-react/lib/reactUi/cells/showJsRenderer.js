// ag-grid-react v31.0.3
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var beansContext_1 = require("../beansContext");
var useJsCellRenderer = function (showDetails, showTools, eCellValue, cellValueVersion, jsCellRendererRef, eGui) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var destroyCellRenderer = react_1.useCallback(function () {
        var comp = jsCellRendererRef.current;
        if (!comp) {
            return;
        }
        var compGui = comp.getGui();
        if (compGui && compGui.parentElement) {
            compGui.parentElement.removeChild(compGui);
        }
        context.destroyBean(comp);
        jsCellRendererRef.current = undefined;
    }, []);
    // create or refresh JS cell renderer
    react_1.useEffect(function () {
        var showValue = showDetails != null;
        var jsCompDetails = showDetails && showDetails.compDetails && !showDetails.compDetails.componentFromFramework;
        var waitingForToolsSetup = showTools && eCellValue == null;
        var showComp = showValue && jsCompDetails && !waitingForToolsSetup;
        // if not showing comp, destroy any existing one and return
        if (!showComp) {
            destroyCellRenderer();
            return;
        }
        var compDetails = showDetails.compDetails;
        if (jsCellRendererRef.current) {
            // attempt refresh if refresh method exists
            var comp_1 = jsCellRendererRef.current;
            var attemptRefresh = comp_1.refresh != null && showDetails.force == false;
            var refreshResult = attemptRefresh ? comp_1.refresh(compDetails.params) : false;
            var refreshWorked = refreshResult === true || refreshResult === undefined;
            // if refresh worked, nothing else to do
            if (refreshWorked) {
                return;
            }
            // if refresh didn't work, we destroy it and continue, so new cell renderer created below
            destroyCellRenderer();
        }
        var promise = compDetails.newAgStackInstance();
        ;
        if (!promise) {
            return;
        }
        var comp = promise.resolveNow(null, function (x) { return x; }); // js comps are never async
        if (!comp) {
            return;
        }
        var compGui = comp.getGui();
        if (!compGui) {
            return;
        }
        var parent = showTools ? eCellValue : eGui.current;
        parent.appendChild(compGui);
        jsCellRendererRef.current = comp;
        // We do not return the destroy here as we want to keep the comp alive for our custom refresh approach above
    }, [showDetails, showTools, cellValueVersion]);
    // this effect makes sure destroyCellRenderer gets called when the
    // component is destroyed. as the other effect only updates when there
    // is a change in state
    react_1.useEffect(function () {
        return destroyCellRenderer;
    }, []);
};
exports.default = useJsCellRenderer;

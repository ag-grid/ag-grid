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
var VERSION_CHECKING_FIRST_GRID_MAJOR_VERSION = 28;
var VERSION_CHECKING_FIRST_CHARTS_MAJOR_VERSION = 6;
function isValidVersion(version) {
    return version && version.match(/\d+\.\d+\.\d+/);
}
function isValidMajorVersion(_a) {
    var gridMajorVersion = _a.gridMajorVersion, chartsMajorVersion = _a.chartsMajorVersion;
    var gridMajor = parseInt(gridMajorVersion, 10);
    var chartsMajor = parseInt(chartsMajorVersion, 10);
    var gridMajorDifference = gridMajor - VERSION_CHECKING_FIRST_GRID_MAJOR_VERSION;
    var chartsMajorDifference = chartsMajor - VERSION_CHECKING_FIRST_CHARTS_MAJOR_VERSION;
    var isFirstOrAfterVersion = gridMajorDifference >= 0;
    return gridMajorDifference === chartsMajorDifference && isFirstOrAfterVersion;
}
export function gridChartVersion(gridVersion) {
    if (!gridVersion || !isValidVersion(gridVersion)) {
        return undefined;
    }
    var _a = __read(gridVersion.split('.') || [], 2), gridMajor = _a[0], gridMinor = _a[1];
    var gridMajorMinor = gridMajor + "." + gridMinor + ".x";
    var gridMajorNumber = parseInt(gridMajor, 10);
    var chartsMajor = (gridMajorNumber - VERSION_CHECKING_FIRST_GRID_MAJOR_VERSION) + VERSION_CHECKING_FIRST_CHARTS_MAJOR_VERSION;
    if (chartsMajor < 0) {
        return undefined;
    }
    var chartsMinor = gridMinor;
    var chartsMajorMinor = chartsMajor + "." + chartsMinor + ".x";
    return {
        gridMajorMinor: gridMajorMinor,
        chartsMajorMinor: chartsMajorMinor
    };
}
export function validGridChartsVersionErrorMessage(_a) {
    var type = _a.type, gridVersion = _a.gridVersion, chartsVersion = _a.chartsVersion;
    var invalidMessage = 'AG Grid: AG Grid version is incompatible. Please see https://www.ag-grid.com/javascript-data-grid/modules/ for more information.';
    if (!gridVersion) {
        return invalidMessage;
    }
    var version = gridChartVersion(gridVersion);
    if (!version) {
        return invalidMessage;
    }
    var gridMajorMinor = version.gridMajorMinor, chartsMajorMinor = version.chartsMajorMinor;
    if (type === 'incompatible') {
        return "AG Grid version " + gridVersion + " and AG Charts version " + chartsVersion + " is not supported. AG Grid version " + gridMajorMinor + " should be used with AG Chart " + chartsMajorMinor + ". Please see https://www.ag-grid.com/javascript-data-grid/modules/ for more information.";
    }
    else if (type === 'invalidCharts') {
        return "AG Grid version " + gridMajorMinor + " should be used with AG Chart " + chartsMajorMinor + ". Please see https://www.ag-grid.com/javascript-data-grid/modules/ for more information.";
    }
    return invalidMessage;
}
export function validGridChartsVersion(_a) {
    var gridVersion = _a.gridVersion, chartsVersion = _a.chartsVersion;
    if (!isValidVersion(chartsVersion)) {
        return {
            isValid: false,
            message: validGridChartsVersionErrorMessage({ type: 'invalidCharts', gridVersion: gridVersion, chartsVersion: chartsVersion })
        };
    }
    if (!isValidVersion(gridVersion)) {
        return {
            isValid: false,
            message: validGridChartsVersionErrorMessage({ type: 'invalidGrid', gridVersion: gridVersion, chartsVersion: chartsVersion })
        };
    }
    var _b = __read(gridVersion.split('.') || [], 2), gridMajor = _b[0], gridMinor = _b[1];
    var _c = __read(chartsVersion.split('.') || [], 2), chartsMajor = _c[0], chartsMinor = _c[1];
    var isValidMajor = isValidMajorVersion({
        gridMajorVersion: gridMajor,
        chartsMajorVersion: chartsMajor
    });
    if (isValidMajor && gridMinor === chartsMinor) {
        return {
            isValid: true
        };
    }
    else if (!isValidMajor || gridMinor !== chartsMinor) {
        return {
            isValid: false,
            message: validGridChartsVersionErrorMessage({ type: 'incompatible', gridVersion: gridVersion, chartsVersion: chartsVersion })
        };
    }
    return {
        isValid: false,
        message: validGridChartsVersionErrorMessage({ type: 'invalid', gridVersion: gridVersion, chartsVersion: chartsVersion })
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRHcmlkQ2hhcnRzVmVyc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlscy92YWxpZEdyaWRDaGFydHNWZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNLHlDQUF5QyxHQUFHLEVBQUUsQ0FBQztBQUNyRCxJQUFNLDJDQUEyQyxHQUFHLENBQUMsQ0FBQztBQUV0RCxTQUFTLGNBQWMsQ0FBQyxPQUFlO0lBQ3JDLE9BQU8sT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDbkQsQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQUMsRUFHNUI7UUFIOEIsZ0JBQWdCLHNCQUFBLEVBQUUsa0JBQWtCLHdCQUFBO0lBSWpFLElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNqRCxJQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFckQsSUFBTSxtQkFBbUIsR0FBRyxTQUFTLEdBQUcseUNBQXlDLENBQUM7SUFDbEYsSUFBTSxxQkFBcUIsR0FBRyxXQUFXLEdBQUcsMkNBQTJDLENBQUM7SUFDeEYsSUFBTSxxQkFBcUIsR0FBRyxtQkFBbUIsSUFBSSxDQUFDLENBQUM7SUFFdkQsT0FBTyxtQkFBbUIsS0FBSyxxQkFBcUIsSUFBSSxxQkFBcUIsQ0FBQztBQUNoRixDQUFDO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFDLFdBQW1CO0lBSWxELElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDaEQsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFFSyxJQUFBLEtBQUEsT0FBeUIsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUEsRUFBcEQsU0FBUyxRQUFBLEVBQUUs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
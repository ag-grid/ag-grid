"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validGridChartsVersion = exports.validGridChartsVersionErrorMessage = exports.gridChartVersion = void 0;
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
function gridChartVersion(gridVersion) {
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
exports.gridChartVersion = gridChartVersion;
function validGridChartsVersionErrorMessage(_a) {
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
exports.validGridChartsVersionErrorMessage = validGridChartsVersionErrorMessage;
function validGridChartsVersion(_a) {
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
exports.validGridChartsVersion = validGridChartsVersion;

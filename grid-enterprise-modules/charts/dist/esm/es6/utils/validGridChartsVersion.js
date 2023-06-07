const VERSION_CHECKING_FIRST_GRID_MAJOR_VERSION = 28;
const VERSION_CHECKING_FIRST_CHARTS_MAJOR_VERSION = 6;
function isValidVersion(version) {
    return version && version.match(/\d+\.\d+\.\d+/);
}
function isValidMajorVersion({ gridMajorVersion, chartsMajorVersion }) {
    const gridMajor = parseInt(gridMajorVersion, 10);
    const chartsMajor = parseInt(chartsMajorVersion, 10);
    const gridMajorDifference = gridMajor - VERSION_CHECKING_FIRST_GRID_MAJOR_VERSION;
    const chartsMajorDifference = chartsMajor - VERSION_CHECKING_FIRST_CHARTS_MAJOR_VERSION;
    const isFirstOrAfterVersion = gridMajorDifference >= 0;
    return gridMajorDifference === chartsMajorDifference && isFirstOrAfterVersion;
}
export function gridChartVersion(gridVersion) {
    if (!gridVersion || !isValidVersion(gridVersion)) {
        return undefined;
    }
    const [gridMajor, gridMinor] = gridVersion.split('.') || [];
    const gridMajorMinor = `${gridMajor}.${gridMinor}.x`;
    const gridMajorNumber = parseInt(gridMajor, 10);
    const chartsMajor = (gridMajorNumber - VERSION_CHECKING_FIRST_GRID_MAJOR_VERSION) + VERSION_CHECKING_FIRST_CHARTS_MAJOR_VERSION;
    if (chartsMajor < 0) {
        return undefined;
    }
    const chartsMinor = gridMinor;
    const chartsMajorMinor = `${chartsMajor}.${chartsMinor}.x`;
    return {
        gridMajorMinor,
        chartsMajorMinor
    };
}
export function validGridChartsVersionErrorMessage({ type, gridVersion, chartsVersion }) {
    const invalidMessage = 'AG Grid: AG Grid version is incompatible. Please see https://www.ag-grid.com/javascript-data-grid/modules/ for more information.';
    if (!gridVersion) {
        return invalidMessage;
    }
    const version = gridChartVersion(gridVersion);
    if (!version) {
        return invalidMessage;
    }
    const { gridMajorMinor, chartsMajorMinor } = version;
    if (type === 'incompatible') {
        return `AG Grid version ${gridVersion} and AG Charts version ${chartsVersion} is not supported. AG Grid version ${gridMajorMinor} should be used with AG Chart ${chartsMajorMinor}. Please see https://www.ag-grid.com/javascript-data-grid/modules/ for more information.`;
    }
    else if (type === 'invalidCharts') {
        return `AG Grid version ${gridMajorMinor} should be used with AG Chart ${chartsMajorMinor}. Please see https://www.ag-grid.com/javascript-data-grid/modules/ for more information.`;
    }
    return invalidMessage;
}
export function validGridChartsVersion({ gridVersion, chartsVersion }) {
    if (!isValidVersion(chartsVersion)) {
        return {
            isValid: false,
            message: validGridChartsVersionErrorMessage({ type: 'invalidCharts', gridVersion, chartsVersion })
        };
    }
    if (!isValidVersion(gridVersion)) {
        return {
            isValid: false,
            message: validGridChartsVersionErrorMessage({ type: 'invalidGrid', gridVersion, chartsVersion })
        };
    }
    const [gridMajor, gridMinor] = gridVersion.split('.') || [];
    const [chartsMajor, chartsMinor] = chartsVersion.split('.') || [];
    const isValidMajor = isValidMajorVersion({
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
            message: validGridChartsVersionErrorMessage({ type: 'incompatible', gridVersion, chartsVersion })
        };
    }
    return {
        isValid: false,
        message: validGridChartsVersionErrorMessage({ type: 'invalid', gridVersion, chartsVersion })
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRHcmlkQ2hhcnRzVmVyc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlscy92YWxpZEdyaWRDaGFydHNWZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0seUNBQXlDLEdBQUcsRUFBRSxDQUFDO0FBQ3JELE1BQU0sMkNBQTJDLEdBQUcsQ0FBQyxDQUFDO0FBRXRELFNBQVMsY0FBYyxDQUFDLE9BQWU7SUFDckMsT0FBTyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUdsRTtJQUNDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNqRCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFckQsTUFBTSxtQkFBbUIsR0FBRyxTQUFTLEdBQUcseUNBQXlDLENBQUM7SUFDbEYsTUFBTSxxQkFBcUIsR0FBRyxXQUFXLEdBQUcsMkNBQTJDLENBQUM7SUFDeEYsTUFBTSxxQkFBcUIsR0FBRyxtQkFBbUIsSUFBSSxDQUFDLENBQUM7SUFFdkQsT0FBTyxtQkFBbUIsS0FBSyxxQkFBcUIsSUFBSSxxQkFBcUIsQ0FBQztBQUNoRixDQUFDO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFDLFdBQW1CO0lBSWxELElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDaEQsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFFRCxNQUFNLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVELE1BQU0sY0FBYyxHQUFHLEdBQUcsU0FBUyxJ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
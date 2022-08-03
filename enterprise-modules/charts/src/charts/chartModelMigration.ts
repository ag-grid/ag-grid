import { ChartModel } from "@ag-grid-community/core";

// the line below is automatically modified during releases - do not modify
// (see scripts/release/updateChartModel.js)
export const CURRENT_VERSION = "28.1.0";

export function upgradeChartModel(model: ChartModel): ChartModel {
    if (model.version == null) {
        // First release with version field.
        model.version = "27.1.0";
    }

    const { major, minor, patch } = versionParts(model.version);
    // TODO: Add some transforms as the model changes over time.
    // if (major < 28) {
    //     model = migrateToV28Model(model);
    // }
    return model;
}

type VersionParts = { major: number, minor: number, patch: number };
function versionParts(version: string): VersionParts {
    const split = typeof version === 'string' ?
        version.split('.').map(v => Number(v)) : 
        [];
    if (split.length !== 3 || split.some((v) => isNaN(v))) {
        throw new Error('AG Grid - Illegal version string: ' + version);
    }

    return {
        major: split[0],
        minor: split[1],
        patch: split[2],
    };
}

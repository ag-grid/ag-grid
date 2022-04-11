"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// the line below is automatically modified during releases - do not modify
// (see scripts/release/updateChartModel.js)
exports.CURRENT_VERSION = "27.1.0";
function upgradeChartModel(model) {
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
exports.upgradeChartModel = upgradeChartModel;
function versionParts(version) {
    if (!/^([:digits:]{1,2}\.){2}[:digits:]{1}$/.test(version)) {
        throw new Error('AG Grid - Illegal version string: ' + version);
    }
    const split = version.split('.')
        .map(v => Number(v));
    return {
        major: split[0],
        minor: split[1],
        patch: split[2],
    };
}
//# sourceMappingURL=chartModelMigration.js.map
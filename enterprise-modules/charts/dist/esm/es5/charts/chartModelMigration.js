// the line below is automatically modified during releases - do not modify
// (see scripts/release/updateChartModel.js)
export var CURRENT_VERSION = "27.1.0";
export function upgradeChartModel(model) {
    if (model.version == null) {
        // First release with version field.
        model.version = "27.1.0";
    }
    var _a = versionParts(model.version), major = _a.major, minor = _a.minor, patch = _a.patch;
    // TODO: Add some transforms as the model changes over time.
    // if (major < 28) {
    //     model = migrateToV28Model(model);
    // }
    return model;
}
function versionParts(version) {
    if (!/^([:digits:]{1,2}\.){2}[:digits:]{1}$/.test(version)) {
        throw new Error('AG Grid - Illegal version string: ' + version);
    }
    var split = version.split('.')
        .map(function (v) { return Number(v); });
    return {
        major: split[0],
        minor: split[1],
        patch: split[2],
    };
}
//# sourceMappingURL=chartModelMigration.js.map
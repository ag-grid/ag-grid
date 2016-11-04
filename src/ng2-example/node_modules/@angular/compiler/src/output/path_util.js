/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// asset:<package-name>/<realm>/<path-to-module>
var _ASSET_URL_RE = /asset:([^\/]+)\/([^\/]+)\/(.+)/;
/**
 * Interface that defines how import statements should be generated.
 */
export var ImportGenerator = (function () {
    function ImportGenerator() {
    }
    ImportGenerator.parseAssetUrl = function (url) { return AssetUrl.parse(url); };
    return ImportGenerator;
}());
export var AssetUrl = (function () {
    function AssetUrl(packageName, firstLevelDir, modulePath) {
        this.packageName = packageName;
        this.firstLevelDir = firstLevelDir;
        this.modulePath = modulePath;
    }
    AssetUrl.parse = function (url, allowNonMatching) {
        if (allowNonMatching === void 0) { allowNonMatching = true; }
        var match = url.match(_ASSET_URL_RE);
        if (match !== null) {
            return new AssetUrl(match[1], match[2], match[3]);
        }
        if (allowNonMatching) {
            return null;
        }
        throw new Error("Url " + url + " is not a valid asset: url");
    };
    return AssetUrl;
}());
//# sourceMappingURL=path_util.js.map
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A container for translated messages
 */
export var TranslationBundle = (function () {
    function TranslationBundle(_messageMap) {
        if (_messageMap === void 0) { _messageMap = {}; }
        this._messageMap = _messageMap;
    }
    TranslationBundle.load = function (content, url, messageBundle, serializer) {
        return new TranslationBundle(serializer.load(content, url, messageBundle));
    };
    TranslationBundle.prototype.get = function (id) { return this._messageMap[id]; };
    TranslationBundle.prototype.has = function (id) { return id in this._messageMap; };
    return TranslationBundle;
}());
//# sourceMappingURL=translation_bundle.js.map
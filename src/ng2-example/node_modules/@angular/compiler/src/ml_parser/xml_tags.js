/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TagContentType } from './tags';
export var XmlTagDefinition = (function () {
    function XmlTagDefinition() {
        this.closedByParent = false;
        this.contentType = TagContentType.PARSABLE_DATA;
        this.isVoid = false;
        this.ignoreFirstLf = false;
        this.canSelfClose = true;
    }
    XmlTagDefinition.prototype.requireExtraParent = function (currentParent) { return false; };
    XmlTagDefinition.prototype.isClosedByChild = function (name) { return false; };
    return XmlTagDefinition;
}());
var _TAG_DEFINITION = new XmlTagDefinition();
export function getXmlTagDefinition(tagName) {
    return _TAG_DEFINITION;
}
//# sourceMappingURL=xml_tags.js.map
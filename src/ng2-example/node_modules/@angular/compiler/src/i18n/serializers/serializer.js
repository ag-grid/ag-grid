/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Generate a map of placeholder to content indexed by message ids
export function extractPlaceholders(messageBundle) {
    var messageMap = messageBundle.getMessageMap();
    var placeholders = {};
    Object.keys(messageMap).forEach(function (msgId) {
        placeholders[msgId] = messageMap[msgId].placeholders;
    });
    return placeholders;
}
// Generate a map of placeholder to message ids indexed by message ids
export function extractPlaceholderToIds(messageBundle) {
    var messageMap = messageBundle.getMessageMap();
    var placeholderToIds = {};
    Object.keys(messageMap).forEach(function (msgId) {
        placeholderToIds[msgId] = messageMap[msgId].placeholderToMsgIds;
    });
    return placeholderToIds;
}
//# sourceMappingURL=serializer.js.map
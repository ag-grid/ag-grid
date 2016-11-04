/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPresent } from '../facade/lang';
export var StylesCollectionEntry = (function () {
    function StylesCollectionEntry(time, value) {
        this.time = time;
        this.value = value;
    }
    StylesCollectionEntry.prototype.matches = function (time, value) {
        return time == this.time && value == this.value;
    };
    return StylesCollectionEntry;
}());
export var StylesCollection = (function () {
    function StylesCollection() {
        this.styles = {};
    }
    StylesCollection.prototype.insertAtTime = function (property, time, value) {
        var tuple = new StylesCollectionEntry(time, value);
        var entries = this.styles[property];
        if (!isPresent(entries)) {
            entries = this.styles[property] = [];
        }
        // insert this at the right stop in the array
        // this way we can keep it sorted
        var insertionIndex = 0;
        for (var i = entries.length - 1; i >= 0; i--) {
            if (entries[i].time <= time) {
                insertionIndex = i + 1;
                break;
            }
        }
        entries.splice(insertionIndex, 0, tuple);
    };
    StylesCollection.prototype.getByIndex = function (property, index) {
        var items = this.styles[property];
        if (isPresent(items)) {
            return index >= items.length ? null : items[index];
        }
        return null;
    };
    StylesCollection.prototype.indexOfAtOrBeforeTime = function (property, time) {
        var entries = this.styles[property];
        if (isPresent(entries)) {
            for (var i = entries.length - 1; i >= 0; i--) {
                if (entries[i].time <= time)
                    return i;
            }
        }
        return null;
    };
    return StylesCollection;
}());
//# sourceMappingURL=styles_collection.js.map
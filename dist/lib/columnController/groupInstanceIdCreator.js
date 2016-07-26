/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
 * @link http://www.ag-grid.com/
 * @license MIT
 */
// class returns unique instance id's for columns.
// eg, the following calls (in this order) will result in:
//
// getInstanceIdForKey('country') => 0
// getInstanceIdForKey('country') => 1
// getInstanceIdForKey('country') => 2
// getInstanceIdForKey('country') => 3
// getInstanceIdForKey('age') => 0
// getInstanceIdForKey('age') => 1
// getInstanceIdForKey('country') => 4
var GroupInstanceIdCreator = (function () {
    function GroupInstanceIdCreator() {
        // this map contains keys to numbers, so we remember what the last call was
        this.existingIds = {};
    }
    GroupInstanceIdCreator.prototype.getInstanceIdForKey = function (key) {
        var lastResult = this.existingIds[key];
        var result;
        if (typeof lastResult !== 'number') {
            // first time this key
            result = 0;
        }
        else {
            result = lastResult + 1;
        }
        this.existingIds[key] = result;
        return result;
    };
    return GroupInstanceIdCreator;
})();
exports.GroupInstanceIdCreator = GroupInstanceIdCreator;

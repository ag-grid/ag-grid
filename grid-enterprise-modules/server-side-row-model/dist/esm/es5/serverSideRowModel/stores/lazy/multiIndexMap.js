var MultiIndexMap = /** @class */ (function () {
    function MultiIndexMap() {
        var indexes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            indexes[_i] = arguments[_i];
        }
        if (indexes.length < 1) {
            throw new Error('AG Grid: At least one index must be provided.');
        }
        this.indexes = indexes;
        this.maps = new Map(this.indexes.map(function (index) { return [index, new Map()]; }));
    }
    MultiIndexMap.prototype.getBy = function (index, key) {
        var map = this.maps.get(index);
        if (!map) {
            throw new Error("AG Grid: ".concat(String(index), " not found"));
        }
        return map.get(key);
    };
    MultiIndexMap.prototype.set = function (item) {
        var _this = this;
        this.indexes.forEach(function (index) {
            var map = _this.maps.get(index);
            if (!map) {
                throw new Error("AG Grid: ".concat(String(index), " not found"));
            }
            map.set(item[index], item);
        });
    };
    MultiIndexMap.prototype.delete = function (item) {
        var _this = this;
        this.indexes.forEach(function (index) {
            var map = _this.maps.get(index);
            if (!map) {
                throw new Error("AG Grid: ".concat(String(index), " not found"));
            }
            map.delete(item[index]);
        });
    };
    MultiIndexMap.prototype.clear = function () {
        this.maps.forEach(function (map) { return map.clear(); });
    };
    MultiIndexMap.prototype.getIterator = function (index) {
        var map = this.maps.get(index);
        if (!map) {
            throw new Error("AG Grid: ".concat(String(index), " not found"));
        }
        return map.values();
    };
    MultiIndexMap.prototype.forEach = function (callback) {
        var iterator = this.getIterator(this.indexes[0]);
        var pointer;
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            callback(pointer.value);
        }
    };
    MultiIndexMap.prototype.find = function (callback) {
        var iterator = this.getIterator(this.indexes[0]);
        var pointer;
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            if (callback(pointer.value)) {
                return pointer.value;
            }
        }
    };
    MultiIndexMap.prototype.filter = function (predicate) {
        var iterator = this.getIterator(this.indexes[0]);
        var pointer;
        var result = [];
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            if (predicate(pointer.value)) {
                result.push(pointer.value);
            }
        }
        return result;
    };
    return MultiIndexMap;
}());
export { MultiIndexMap };

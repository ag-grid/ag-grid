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
            throw new Error("AG Grid: " + String(index) + " not found");
        }
        return map.get(key);
    };
    MultiIndexMap.prototype.set = function (item) {
        var _this = this;
        this.indexes.forEach(function (index) {
            var map = _this.maps.get(index);
            if (!map) {
                throw new Error("AG Grid: " + String(index) + " not found");
            }
            map.set(item[index], item);
        });
    };
    MultiIndexMap.prototype.delete = function (item) {
        var _this = this;
        this.indexes.forEach(function (index) {
            var map = _this.maps.get(index);
            if (!map) {
                throw new Error("AG Grid: " + String(index) + " not found");
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
            throw new Error("AG Grid: " + String(index) + " not found");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlJbmRleE1hcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zZXJ2ZXJTaWRlUm93TW9kZWwvc3RvcmVzL2xhenkvbXVsdGlJbmRleE1hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUlJO1FBQVksaUJBQXVCO2FBQXZCLFVBQXVCLEVBQXZCLHFCQUF1QixFQUF2QixJQUF1QjtZQUF2Qiw0QkFBdUI7O1FBQy9CLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1NBQ3BFO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FDZixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLENBQUMsS0FBSyxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUNoRCxDQUFDO0lBQ04sQ0FBQztJQUVNLDZCQUFLLEdBQVosVUFBYSxLQUFjLEVBQUUsR0FBUTtRQUNqQyxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyxjQUFZLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBWSxDQUFDLENBQUM7U0FDMUQ7UUFDRCxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVNLDJCQUFHLEdBQVYsVUFBVyxJQUFPO1FBQWxCLGlCQVFDO1FBUEcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLO1lBQ3RCLElBQU0sR0FBRyxHQUFHLEtBQUksQ0FBQyxJQUFJLENB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
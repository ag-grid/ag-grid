import { Node } from './node';
var Selection = /** @class */ (function () {
    function Selection(parent, classOrFactory) {
        this._nodes = [];
        this._data = [];
        this._parent = parent;
        this._factory = Object.prototype.isPrototypeOf.call(Node, classOrFactory)
            ? function () { return new classOrFactory(); }
            : classOrFactory;
    }
    Selection.select = function (parent, classOrFactory) {
        return new Selection(parent, classOrFactory);
    };
    Selection.prototype.each = function (iterate) {
        this._nodes.forEach(function (node, i) { return iterate(node, node.datum, i); });
        return this;
    };
    Selection.prototype.update = function (data, init) {
        var _this = this;
        var old = this._data;
        var parent = this._parent;
        var factory = this._factory;
        if (data.length > old.length) {
            data.slice(old.length).forEach(function (datum) {
                var node = factory(datum);
                node.datum = datum;
                init === null || init === void 0 ? void 0 : init(node);
                parent.appendChild(node);
                _this._nodes.push(node);
            });
        }
        else if (data.length < old.length) {
            this._nodes.splice(data.length).forEach(function (node) {
                parent.removeChild(node);
            });
        }
        this._data = data.slice(0);
        for (var i = 0; i < data.length; i++) {
            this._nodes[i].datum = this._data[i];
        }
        return this;
    };
    Selection.prototype.clear = function () {
        this.update([]);
        return this;
    };
    Selection.selectAll = function (parent, predicate) {
        var results = [];
        var traverse = function (node) {
            if (predicate(node)) {
                results.push(node);
            }
            node.children.forEach(traverse);
        };
        traverse(parent);
        return results;
    };
    Selection.selectByClass = function (node, Class) {
        return Selection.selectAll(node, function (node) { return node instanceof Class; });
    };
    Selection.selectByTag = function (node, tag) {
        return Selection.selectAll(node, function (node) { return node.tag === tag; });
    };
    Selection.prototype.select = function (predicate) {
        return Selection.selectAll(this._parent, predicate);
    };
    Selection.prototype.selectByClass = function (Class) {
        return this.select(function (node) { return node instanceof Class; });
    };
    Selection.prototype.selectByTag = function (tag) {
        return this.select(function (node) { return node.tag === tag; });
    };
    Selection.prototype.nodes = function () {
        return this._nodes;
    };
    return Selection;
}());
export { Selection };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjZW5lL3NlbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBTTlCO0lBQ0ksbUJBQVksTUFBWSxFQUFFLGNBQXdEO1FBZTFFLFdBQU0sR0FBYSxFQUFFLENBQUM7UUFDdEIsVUFBSyxHQUFhLEVBQUUsQ0FBQztRQWZ6QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDO1lBQ3JFLENBQUMsQ0FBQyxjQUFNLE9BQUEsSUFBSyxjQUEwQyxFQUFFLEVBQWpELENBQWlEO1lBQ3pELENBQUMsQ0FBRSxjQUE4QyxDQUFDO0lBQzFELENBQUM7SUFFTSxnQkFBTSxHQUFiLFVBQ0ksTUFBWSxFQUNaLGNBQXdEO1FBRXhELE9BQU8sSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFPRCx3QkFBSSxHQUFKLFVBQUssT0FBNkQ7UUFDOUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUUsQ0FBQyxJQUFLLE9BQUEsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUE1QixDQUE0QixDQUFDLENBQUM7UUFDL0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELDBCQUFNLEdBQU4sVUFBTyxJQUFjLEVBQUUsSUFBNkI7UUFBcEQsaUJBeUJDO1FBeEJHLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdkIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QixJQUFN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
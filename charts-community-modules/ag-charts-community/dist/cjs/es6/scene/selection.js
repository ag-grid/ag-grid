"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Selection = void 0;
const node_1 = require("./node");
class Selection {
    constructor(parent, classOrFactory) {
        this._nodes = [];
        this._data = [];
        this._parent = parent;
        this._factory = Object.prototype.isPrototypeOf.call(node_1.Node, classOrFactory)
            ? () => new classOrFactory()
            : classOrFactory;
    }
    static select(parent, classOrFactory) {
        return new Selection(parent, classOrFactory);
    }
    each(iterate) {
        this._nodes.forEach((node, i) => iterate(node, node.datum, i));
        return this;
    }
    update(data, init) {
        const old = this._data;
        const parent = this._parent;
        const factory = this._factory;
        if (data.length > old.length) {
            data.slice(old.length).forEach((datum) => {
                const node = factory(datum);
                node.datum = datum;
                init && init(node);
                parent.appendChild(node);
                this._nodes.push(node);
            });
        }
        else if (data.length < old.length) {
            this._nodes.splice(data.length).forEach((node) => {
                parent.removeChild(node);
            });
        }
        this._data = data;
        for (let i = 0; i < data.length; i++) {
            this._nodes[i].datum = this._data[i];
        }
        return this;
    }
    clear() {
        this.update([]);
        return this;
    }
    select(predicate) {
        const results = [];
        const traverse = (node) => {
            if (predicate(node)) {
                results.push(node);
            }
            node.children.forEach(traverse);
        };
        traverse(this._parent);
        return results;
    }
    selectByClass(Class) {
        return this.select((node) => node instanceof Class);
    }
    selectByTag(tag) {
        return this.select((node) => node.tag === tag);
    }
    nodes() {
        return this._nodes;
    }
}
exports.Selection = Selection;

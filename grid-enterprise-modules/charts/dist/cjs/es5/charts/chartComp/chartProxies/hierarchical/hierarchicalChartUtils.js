"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAutoGroupHierarchy = exports.createCategoryHierarchy = exports.CATEGORY_LABEL_KEY = void 0;
exports.CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';
function createCategoryHierarchy(data, categoryKeys) {
    var hierarchy = buildNestedHierarchy(data, getItemDepth, getItemCategoryLabel);
    return formatCategoryHierarchy(hierarchy);
    function getItemDepth(item) {
        return categoryKeys.length;
    }
    function getItemCategoryLabel(item, categoryIndex) {
        var categoryKey = categoryKeys[categoryIndex];
        var categoryValue = item[categoryKey];
        return getCategoryLabel(categoryValue);
    }
    function getCategoryLabel(value) {
        if (value == null)
            return null;
        return String(value);
    }
}
exports.createCategoryHierarchy = createCategoryHierarchy;
function createAutoGroupHierarchy(data, getItemLabels) {
    var hierarchy = buildNestedHierarchy(data, getItemDepth, getItemGroupLabel);
    return formatCategoryHierarchy(hierarchy);
    function getItemDepth(item) {
        var _a, _b;
        return (_b = (_a = getItemLabels(item)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }
    function getItemGroupLabel(item, groupIndex) {
        var labels = getItemLabels(item);
        if (!labels)
            return null;
        // Autogroup label values are ordered from the leaf outwards
        var labelIndex = labels.length - 1 - groupIndex;
        return labels[labelIndex];
    }
}
exports.createAutoGroupHierarchy = createAutoGroupHierarchy;
/* Utility functions for building and formatting nested category hierarchies */
/** Convert an abstract nested hierarchy structure into an ag-charts-compatible 'category-grouped' data structure */
function formatCategoryHierarchy(hierarchy) {
    var e_1, _a;
    var depth = hierarchy.depth, leaves = hierarchy.leaves, children = hierarchy.children;
    // If there are no remaining levels of nesting, return a flat list of leaves with no category labels
    if (depth === 0)
        return leaves.map(function (item) {
            var _a;
            return (__assign((_a = {}, _a[exports.CATEGORY_LABEL_KEY] = null, _a), item));
        });
    var results = new Array();
    var _loop_1 = function (key, childHierarchy) {
        var _e;
        if (childHierarchy.depth === 0) {
            // If this the deepest parent level, return a flat list of child leaves with their respective category keys
            results.push.apply(results, __spreadArray([], __read(childHierarchy.leaves.map(function (item) {
                var _a;
                return (__assign((_a = {}, _a[exports.CATEGORY_LABEL_KEY] = key, _a), item));
            })), false));
        }
        else {
            // Otherwise nest the grouped data recursively (ignoring any leaves defined at the current parent level)
            results.push((_e = {}, _e[exports.CATEGORY_LABEL_KEY] = key, _e.children = formatCategoryHierarchy(childHierarchy), _e));
        }
    };
    try {
        // Push all branches and leaves into the result set, grouping results by the input tree hierarchy path
        for (var _b = __values(children.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), key = _d[0], childHierarchy = _d[1];
            _loop_1(key, childHierarchy);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return results;
}
/** Build an arbitrarily deeply nested hierarchy from a flat list of input items */
function buildNestedHierarchy(data, getItemDepth, getItemGroupKey) {
    var hierarchy = { depth: 0, leaves: [], children: new Map() };
    return data.reduce(function (hierarchy, item) {
        var itemDepth = getItemDepth(item);
        var currentDepth = 0;
        return createNestedItemHierarchy(item, itemDepth, getItemGroupKey, currentDepth, hierarchy);
    }, hierarchy);
    function createNestedItemHierarchy(item, itemDepth, getItemGroupKey, currentDepth, hierarchy) {
        if (currentDepth === itemDepth) {
            hierarchy.leaves.push(item);
            return hierarchy;
        }
        else {
            var key = getItemGroupKey(item, currentDepth);
            var existingChildHierarchy = hierarchy.children.get(key);
            var childHierarchy = createNestedItemHierarchy(item, itemDepth, getItemGroupKey, currentDepth + 1, existingChildHierarchy || { depth: 0, leaves: [], children: new Map() });
            hierarchy.children.set(key, childHierarchy);
            hierarchy.depth = Math.max(1 + childHierarchy.depth, hierarchy.depth);
            return hierarchy;
        }
    }
}

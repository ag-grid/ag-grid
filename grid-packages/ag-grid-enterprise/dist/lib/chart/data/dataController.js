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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataController = void 0;
var json_1 = require("../../util/json");
var logger_1 = require("../../util/logger");
var window_1 = require("../../util/window");
var dataModel_1 = require("./dataModel");
/** Implements cross-series data model coordination. */
var DataController = /** @class */ (function () {
    function DataController() {
        this.requested = [];
        this.status = 'setup';
    }
    DataController.prototype.request = function (id, data, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.status !== 'setup')
                    throw new Error("AG Charts - data request after data setup phase.");
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.requested.push({
                            id: id,
                            opts: opts,
                            data: data,
                            resultCb: resolve,
                            reject: reject,
                        });
                    })];
            });
        });
    };
    DataController.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var merged, _loop_1, this_1, merged_1, merged_1_1, _a, opts, data, resultCbs, rejects, ids;
            var e_1, _b;
            return __generator(this, function (_c) {
                if (this.status !== 'setup')
                    throw new Error("AG Charts - data request after data setup phase.");
                this.status = 'executed';
                if (DataController.DEBUG())
                    logger_1.Logger.debug('DataController.execute() - requested', this.requested);
                merged = this.mergeRequested();
                if (DataController.DEBUG())
                    logger_1.Logger.debug('DataController.execute() - merged', merged);
                _loop_1 = function (opts, data, resultCbs, rejects, ids) {
                    try {
                        var dataModel_2 = new dataModel_1.DataModel(opts);
                        var processedData_1 = dataModel_2.processData(data);
                        if (processedData_1 && processedData_1.partialValidDataCount === 0) {
                            resultCbs.forEach(function (cb) { return cb({ dataModel: dataModel_2, processedData: processedData_1 }); });
                        }
                        else if (processedData_1) {
                            this_1.splitResult(dataModel_2, processedData_1, ids, resultCbs);
                        }
                        else {
                            rejects.forEach(function (cb) { return cb(new Error("AG Charts - no processed data generated")); });
                        }
                    }
                    catch (error) {
                        rejects.forEach(function (cb) { return cb(error); });
                    }
                };
                this_1 = this;
                try {
                    for (merged_1 = __values(merged), merged_1_1 = merged_1.next(); !merged_1_1.done; merged_1_1 = merged_1.next()) {
                        _a = merged_1_1.value, opts = _a.opts, data = _a.data, resultCbs = _a.resultCbs, rejects = _a.rejects, ids = _a.ids;
                        _loop_1(opts, data, resultCbs, rejects, ids);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (merged_1_1 && !merged_1_1.done && (_b = merged_1.return)) _b.call(merged_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return [2 /*return*/];
            });
        });
    };
    DataController.prototype.mergeRequested = function () {
        var e_2, _a;
        var grouped = [];
        var keys = function (props) {
            return props
                .filter(function (p) { return p.type === 'key'; })
                .map(function (p) { return p.property; })
                .join(';');
        };
        var groupMatch = function (_a) {
            var opts = _a.opts, data = _a.data;
            return function (gr) {
                return (gr[0].data === data &&
                    gr[0].opts.groupByKeys === opts.groupByKeys &&
                    gr[0].opts.dataVisible === opts.dataVisible &&
                    gr[0].opts.groupByFn === opts.groupByFn &&
                    keys(gr[0].opts.props) === keys(opts.props));
            };
        };
        var propMatch = function (prop) { return function (existing) {
            var _a;
            if (existing.type !== prop.type)
                return false;
            if (existing.id !== prop.id)
                return false;
            var diff = (_a = json_1.jsonDiff(existing, prop)) !== null && _a !== void 0 ? _a : {};
            delete diff['scopes'];
            return Object.keys(diff).length === 0;
        }; };
        var mergeOpts = function (opts) {
            return __assign(__assign({}, opts[0]), { props: opts.reduce(function (result, next) {
                    var e_3, _a, _b;
                    var _c, _d, _e;
                    try {
                        for (var _f = __values(next.props), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var prop = _g.value;
                            var match = result.find(propMatch(prop));
                            if (match) {
                                (_c = match.scopes) !== null && _c !== void 0 ? _c : (match.scopes = []);
                                (_b = match.scopes).push.apply(_b, __spreadArray(__spreadArray([], __read(((_d = prop.scopes) !== null && _d !== void 0 ? _d : []))), __read(((_e = next.scopes) !== null && _e !== void 0 ? _e : []))));
                                continue;
                            }
                            result.push(prop);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    return result;
                }, []) });
        };
        var merge = function (props) {
            return {
                ids: props.map(function (_a) {
                    var id = _a.id;
                    return id;
                }),
                resultCbs: props.map(function (_a) {
                    var resultCb = _a.resultCb;
                    return resultCb;
                }),
                rejects: props.map(function (_a) {
                    var reject = _a.reject;
                    return reject;
                }),
                data: props[0].data,
                opts: mergeOpts(props.map(function (_a) {
                    var opts = _a.opts;
                    return opts;
                })),
            };
        };
        try {
            for (var _b = __values(this.requested), _c = _b.next(); !_c.done; _c = _b.next()) {
                var request = _c.value;
                var match = grouped.find(groupMatch(request));
                if (match) {
                    match.push(request);
                }
                else {
                    grouped.push([request]);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return grouped.map(merge);
    };
    DataController.prototype.splitResult = function (dataModel, processedData, scopes, resultCbs) {
        var _loop_2 = function (index) {
            var scope = scopes[index];
            var resultCb = resultCbs[index];
            resultCb({
                dataModel: dataModel,
                processedData: __assign(__assign({}, processedData), { data: processedData.data.filter(function (_a) {
                        var validScopes = _a.validScopes;
                        return validScopes == null || validScopes.some(function (s) { return s === scope; });
                    }) }),
            });
        };
        for (var index = 0; index < scopes.length; index++) {
            _loop_2(index);
        }
    };
    DataController.DEBUG = function () { var _a; return (_a = [true, 'data-model'].includes(window_1.windowValue('agChartsDebug'))) !== null && _a !== void 0 ? _a : false; };
    return DataController;
}());
exports.DataController = DataController;
//# sourceMappingURL=dataController.js.map
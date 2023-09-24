"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataController = void 0;
const json_1 = require("../../util/json");
const logger_1 = require("../../util/logger");
const window_1 = require("../../util/window");
const dataModel_1 = require("./dataModel");
/** Implements cross-series data model coordination. */
class DataController {
    constructor() {
        this.requested = [];
        this.status = 'setup';
    }
    request(id, data, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status !== 'setup')
                throw new Error(`AG Charts - data request after data setup phase.`);
            return new Promise((resolve, reject) => {
                this.requested.push({
                    id,
                    opts,
                    data,
                    resultCb: resolve,
                    reject,
                });
            });
        });
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status !== 'setup')
                throw new Error(`AG Charts - data request after data setup phase.`);
            this.status = 'executed';
            if (DataController.DEBUG())
                logger_1.Logger.debug('DataController.execute() - requested', this.requested);
            const merged = this.mergeRequested();
            if (DataController.DEBUG())
                logger_1.Logger.debug('DataController.execute() - merged', merged);
            for (const { opts, data, resultCbs, rejects, ids } of merged) {
                try {
                    const dataModel = new dataModel_1.DataModel(opts);
                    const processedData = dataModel.processData(data);
                    if (processedData && processedData.partialValidDataCount === 0) {
                        resultCbs.forEach((cb) => cb({ dataModel, processedData }));
                    }
                    else if (processedData) {
                        this.splitResult(dataModel, processedData, ids, resultCbs);
                    }
                    else {
                        rejects.forEach((cb) => cb(new Error(`AG Charts - no processed data generated`)));
                    }
                }
                catch (error) {
                    rejects.forEach((cb) => cb(error));
                }
            }
        });
    }
    mergeRequested() {
        const grouped = [];
        const keys = (props) => {
            return props
                .filter((p) => p.type === 'key')
                .map((p) => p.property)
                .join(';');
        };
        const groupMatch = ({ opts, data }) => (gr) => {
            return (gr[0].data === data &&
                gr[0].opts.groupByKeys === opts.groupByKeys &&
                gr[0].opts.dataVisible === opts.dataVisible &&
                gr[0].opts.groupByFn === opts.groupByFn &&
                keys(gr[0].opts.props) === keys(opts.props));
        };
        const propMatch = (prop) => (existing) => {
            var _a;
            if (existing.type !== prop.type)
                return false;
            if (existing.id !== prop.id)
                return false;
            const diff = (_a = json_1.jsonDiff(existing, prop)) !== null && _a !== void 0 ? _a : {};
            delete diff['scopes'];
            return Object.keys(diff).length === 0;
        };
        const mergeOpts = (opts) => {
            return Object.assign(Object.assign({}, opts[0]), { props: opts.reduce((result, next) => {
                    var _a, _b, _c;
                    for (const prop of next.props) {
                        const match = result.find(propMatch(prop));
                        if (match) {
                            (_a = match.scopes) !== null && _a !== void 0 ? _a : (match.scopes = []);
                            match.scopes.push(...((_b = prop.scopes) !== null && _b !== void 0 ? _b : []), ...((_c = next.scopes) !== null && _c !== void 0 ? _c : []));
                            continue;
                        }
                        result.push(prop);
                    }
                    return result;
                }, []) });
        };
        const merge = (props) => {
            return {
                ids: props.map(({ id }) => id),
                resultCbs: props.map(({ resultCb }) => resultCb),
                rejects: props.map(({ reject }) => reject),
                data: props[0].data,
                opts: mergeOpts(props.map(({ opts }) => opts)),
            };
        };
        for (const request of this.requested) {
            const match = grouped.find(groupMatch(request));
            if (match) {
                match.push(request);
            }
            else {
                grouped.push([request]);
            }
        }
        return grouped.map(merge);
    }
    splitResult(dataModel, processedData, scopes, resultCbs) {
        for (let index = 0; index < scopes.length; index++) {
            const scope = scopes[index];
            const resultCb = resultCbs[index];
            resultCb({
                dataModel,
                processedData: Object.assign(Object.assign({}, processedData), { data: processedData.data.filter(({ validScopes }) => {
                        return validScopes == null || validScopes.some((s) => s === scope);
                    }) }),
            });
        }
    }
}
exports.DataController = DataController;
DataController.DEBUG = () => { var _a; return (_a = [true, 'data-model'].includes(window_1.windowValue('agChartsDebug'))) !== null && _a !== void 0 ? _a : false; };

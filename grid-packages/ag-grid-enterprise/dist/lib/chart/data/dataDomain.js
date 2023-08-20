"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataDomain = void 0;
var DataDomain = /** @class */ (function () {
    function DataDomain(type) {
        this.type = type;
        this.continuousDomain = [Infinity, -Infinity];
        this.discreteDomain = new Set();
    }
    DataDomain.prototype.extend = function (val) {
        if (this.type === 'discrete') {
            this.discreteDomain.add(val);
        }
        else if (this.type === 'continuous') {
            if (this.continuousDomain[0] > val) {
                this.continuousDomain[0] = val;
            }
            if (this.continuousDomain[1] < val) {
                this.continuousDomain[1] = val;
            }
        }
    };
    DataDomain.prototype.getDomain = function () {
        if (this.type === 'discrete') {
            return this.discreteDomain;
        }
        else if (this.type === 'continuous') {
            return this.continuousDomain;
        }
        throw new Error('AG Charts - Unsupported data domain type: ' + this.type);
    };
    return DataDomain;
}());
exports.DataDomain = DataDomain;
//# sourceMappingURL=dataDomain.js.map
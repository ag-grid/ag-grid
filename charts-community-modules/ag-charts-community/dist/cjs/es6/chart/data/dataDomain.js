"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataDomain = void 0;
class DataDomain {
    constructor(type) {
        this.type = type;
        this.continuousDomain = [Infinity, -Infinity];
        this.discreteDomain = new Set();
    }
    extend(val) {
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
    }
    getDomain() {
        if (this.type === 'discrete') {
            return this.discreteDomain;
        }
        else if (this.type === 'continuous') {
            return this.continuousDomain;
        }
        throw new Error('AG Charts - Unsupported data domain type: ' + this.type);
    }
}
exports.DataDomain = DataDomain;

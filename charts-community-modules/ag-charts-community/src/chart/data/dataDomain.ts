export class DataDomain {
    private continuousDomain = [Infinity, -Infinity];
    private discreteDomain = new Set();

    public constructor(private readonly type: 'continuous' | 'discrete') {}

    extend(val: any) {
        if (this.type === 'discrete') {
            this.discreteDomain.add(val);
        } else if (this.type === 'continuous') {
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
        } else if (this.type === 'continuous') {
            return this.continuousDomain;
        }

        throw new Error('AG Charts - Unsupported data domain type: ' + this.type);
    }
}

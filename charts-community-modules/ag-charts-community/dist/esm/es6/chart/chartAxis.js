var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Axis } from '../axis';
import { ChartAxisDirection } from './chartAxisDirection';
import { LinearScale } from '../scale/linearScale';
import { ContinuousScale } from '../scale/continuousScale';
import { POSITION, STRING_ARRAY, Validate } from '../util/validation';
export class ChartAxis extends Axis {
    constructor(moduleCtx, scale) {
        super(moduleCtx, scale);
        this.keys = [];
        this.boundSeries = [];
        this.includeInvisibleDomains = false;
        this.modules = {};
        this.position = 'left';
    }
    get type() {
        var _a;
        return (_a = this.constructor.type) !== null && _a !== void 0 ? _a : '';
    }
    get direction() {
        return ['top', 'bottom'].includes(this.position) ? ChartAxisDirection.X : ChartAxisDirection.Y;
    }
    useCalculatedTickCount() {
        // We only want to use the new algorithm for number axes. Category axes don't use a
        // calculated or user-supplied tick-count, and time axes need special handling depending on
        // the time-range involved.
        return this.scale instanceof LinearScale;
    }
    update(primaryTickCount) {
        this.updateDirection();
        return super.update(primaryTickCount);
    }
    updateDirection() {
        switch (this.position) {
            case 'top':
                this.rotation = -90;
                this.label.mirrored = true;
                this.label.parallel = true;
                break;
            case 'right':
                this.rotation = 0;
                this.label.mirrored = true;
                this.label.parallel = false;
                break;
            case 'bottom':
                this.rotation = -90;
                this.label.mirrored = false;
                this.label.parallel = true;
                break;
            case 'left':
                this.rotation = 0;
                this.label.mirrored = false;
                this.label.parallel = false;
                break;
        }
        if (this.axisContext) {
            this.axisContext.position = this.position;
            this.axisContext.direction = this.direction;
        }
    }
    calculateDomain() {
        const { direction, boundSeries, includeInvisibleDomains } = this;
        if (this.linkedTo) {
            this.dataDomain = this.linkedTo.dataDomain;
        }
        else {
            const domains = [];
            const visibleSeries = boundSeries.filter((s) => includeInvisibleDomains || s.isEnabled());
            for (const series of visibleSeries) {
                domains.push(series.getDomain(direction));
            }
            const domain = new Array().concat(...domains);
            this.dataDomain = this.normaliseDataDomain(domain);
        }
    }
    normaliseDataDomain(d) {
        return d;
    }
    isAnySeriesActive() {
        return this.boundSeries.some((s) => this.includeInvisibleDomains || s.isEnabled());
    }
    getLayoutState() {
        return Object.assign({ rect: this.computeBBox(), gridPadding: this.gridPadding, seriesAreaPadding: this.seriesAreaPadding, tickSize: this.tick.size }, this.layout);
    }
    addModule(module) {
        if (this.modules[module.optionsKey] != null) {
            throw new Error('AG Charts - module already initialised: ' + module.optionsKey);
        }
        if (this.axisContext == null) {
            const keys = () => {
                return this.boundSeries
                    .map((s) => s.getKeys(this.direction))
                    .reduce((keys, seriesKeys) => {
                    keys.push(...seriesKeys);
                    return keys;
                }, []);
            };
            this.axisContext = {
                axisId: this.id,
                position: this.position,
                direction: this.direction,
                continuous: this.scale instanceof ContinuousScale,
                keys,
                scaleValueFormatter: (specifier) => { var _a, _b, _c; return (_c = (_b = (_a = this.scale).tickFormat) === null || _b === void 0 ? void 0 : _b.call(_a, { specifier })) !== null && _c !== void 0 ? _c : undefined; },
                scaleBandwidth: () => { var _a; return (_a = this.scale.bandwidth) !== null && _a !== void 0 ? _a : 0; },
                scaleConvert: (val) => this.scale.convert(val),
                scaleInvert: (val) => { var _a, _b, _c; return (_c = (_b = (_a = this.scale).invert) === null || _b === void 0 ? void 0 : _b.call(_a, val)) !== null && _c !== void 0 ? _c : undefined; },
            };
        }
        const moduleInstance = new module.instanceConstructor(Object.assign(Object.assign({}, this.moduleCtx), { parent: this.axisContext }));
        this.modules[module.optionsKey] = { instance: moduleInstance };
        this[module.optionsKey] = moduleInstance;
    }
    removeModule(module) {
        var _a, _b;
        (_b = (_a = this.modules[module.optionsKey]) === null || _a === void 0 ? void 0 : _a.instance) === null || _b === void 0 ? void 0 : _b.destroy();
        delete this.modules[module.optionsKey];
        delete this[module.optionsKey];
    }
    isModuleEnabled(module) {
        return this.modules[module.optionsKey] != null;
    }
    destroy() {
        super.destroy();
        for (const [key, module] of Object.entries(this.modules)) {
            module.instance.destroy();
            delete this.modules[key];
            delete this[key];
        }
    }
    getTitleFormatterParams() {
        var _a;
        const boundSeries = this.boundSeries.reduce((acc, next) => {
            const keys = next.getKeys(this.direction);
            const names = next.getNames(this.direction);
            for (let idx = 0; idx < keys.length; idx++) {
                acc.push({
                    key: keys[idx],
                    name: names[idx],
                });
            }
            return acc;
        }, []);
        return {
            direction: this.direction,
            boundSeries,
            defaultValue: (_a = this.title) === null || _a === void 0 ? void 0 : _a.text,
        };
    }
}
__decorate([
    Validate(STRING_ARRAY)
], ChartAxis.prototype, "keys", void 0);
__decorate([
    Validate(POSITION)
], ChartAxis.prototype, "position", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRBeGlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2NoYXJ0QXhpcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxPQUFPLEVBQUUsSUFBSSxFQUFnQixNQUFNLFNBQVMsQ0FBQztBQUM3QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzNELE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBZXRFLE1BQU0sT0FBTyxTQUEwRixTQUFRLElBRzlHO0lBeUJHLFlBQXNCLFNBQXdCLEVBQUUsS0FBUTtRQUNwRCxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBeEI1QixTQUFJLEdBQWEsRUFBRSxDQUFDO1FBRXBCLGdCQUFXLEdBQWtCLEVBQUUsQ0FBQztRQUVoQyw0QkFBdUIsR0FBWSxLQUFLLENBQUM7UUFFdEIsWUFBTyxHQUFpRCxFQUFFLENBQUM7UUFzQjlFLGFBQVEsR0FBNEIsTUFBTSxDQUFDO0lBSDNDLENBQUM7SUFqQkQsSUFBSSxJQUFJOztRQUNKLE9BQU8sTUFBQyxJQUFJLENBQUMsV0FBbUIsQ0FBQyxJQUFJLG1DQUFJLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztJQUNuRyxDQUFDO0lBRVMsc0JBQXNCO1FBQzVCLG1GQUFtRjtRQUNuRiwyRkFB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
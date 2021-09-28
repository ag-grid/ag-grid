var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Vue } from 'vue-property-decorator';
import { AgChart } from 'ag-charts-community';
var AgChartsVue = /** @class */ (function (_super) {
    __extends(AgChartsVue, _super);
    function AgChartsVue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isCreated = false;
        _this.isDestroyed = false;
        return _this;
    }
    AgChartsVue.prototype.render = function (h) {
        return h('div', { style: { height: '100%' } });
    };
    AgChartsVue.prototype.mounted = function () {
        var _this = this;
        var options = this.applyContainerIfNotSet(this.options);
        this.chart = AgChart.create(options);
        this.$watch('options', function (newValue, oldValue) {
            _this.processChanges(newValue, oldValue);
        });
        this.isCreated = true;
    };
    AgChartsVue.prototype.destroyed = function () {
        if (this.isCreated) {
            if (this.chart) {
                this.chart.destroy();
            }
            this.isDestroyed = true;
        }
    };
    AgChartsVue.prototype.processChanges = function (currentValue, previousValue) {
        if (this.isCreated) {
            AgChart.update(this.chart, this.applyContainerIfNotSet(this.options));
        }
    };
    AgChartsVue.prototype.applyContainerIfNotSet = function (propsOptions) {
        if (propsOptions.container) {
            return propsOptions;
        }
        return __assign(__assign({}, propsOptions), { container: this.$el });
    };
    AgChartsVue = __decorate([
        Component({
            props: {
                options: {},
            },
        })
    ], AgChartsVue);
    return AgChartsVue;
}(Vue));
export { AgChartsVue };

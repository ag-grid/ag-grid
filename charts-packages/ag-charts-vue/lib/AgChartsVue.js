var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Vue } from 'vue-property-decorator';
import { AgChart } from 'ag-charts-community';
let AgChartsVue = class AgChartsVue extends Vue {
    constructor() {
        super(...arguments);
        this.isCreated = false;
        this.isDestroyed = false;
    }
    render(h) {
        return h('div', { style: { height: '100%' } });
    }
    mounted() {
        const options = this.applyContainerIfNotSet(this.options);
        this.chart = AgChart.create(options);
        this.$watch('options', (newValue, oldValue) => {
            this.processChanges(newValue, oldValue);
        });
        this.isCreated = true;
    }
    destroyed() {
        if (this.isCreated) {
            if (this.chart) {
                this.chart.destroy();
            }
            this.isDestroyed = true;
        }
    }
    processChanges(currentValue, previousValue) {
        if (this.isCreated) {
            AgChart.update(this.chart, this.applyContainerIfNotSet(this.options));
        }
    }
    applyContainerIfNotSet(propsOptions) {
        if (propsOptions.container) {
            return propsOptions;
        }
        return Object.assign(Object.assign({}, propsOptions), { container: this.$el });
    }
};
AgChartsVue = __decorate([
    Component({
        props: {
            options: {},
        },
    })
], AgChartsVue);
export { AgChartsVue };

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFloatingFilter = void 0;
const textFilter_1 = require("./textFilter");
const textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
class TextFloatingFilter extends textInputFloatingFilter_1.TextInputFloatingFilter {
    init(params) {
        super.init(params);
        this.filterModelFormatter = new textFilter_1.TextFilterModelFormatter(this.localeService, this.optionsFactory);
    }
    onParamsUpdated(params) {
        super.onParamsUpdated(params);
        this.filterModelFormatter.updateParams({ optionsFactory: this.optionsFactory });
    }
    getDefaultFilterOptions() {
        return textFilter_1.TextFilter.DEFAULT_FILTER_OPTIONS;
    }
    getFilterModelFormatter() {
        return this.filterModelFormatter;
    }
    createFloatingFilterInputService() {
        return this.createManagedBean(new textInputFloatingFilter_1.FloatingFilterTextInputService());
    }
}
exports.TextFloatingFilter = TextFloatingFilter;

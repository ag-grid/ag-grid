import { Legend } from '../legend.mjs';
const LEGEND_FACTORIES = {
    category: Legend,
};
export function registerLegend(type, ctr) {
    if (LEGEND_FACTORIES[type]) {
        throw new Error(`AG Charts - already registered legend type: ${type}`);
    }
    LEGEND_FACTORIES[type] = ctr;
}
export function getLegend(type, ctx) {
    if (LEGEND_FACTORIES[type]) {
        return new LEGEND_FACTORIES[type](ctx);
    }
    throw new Error(`AG Charts - unknown legend type: ${type}`);
}

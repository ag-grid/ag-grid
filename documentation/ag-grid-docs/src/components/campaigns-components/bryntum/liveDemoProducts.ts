// `demoCss` is a per-product stylesheet ported from the upstream Bryntum
// example's app.css. It is loaded only when that product's live demo is on the
// page (see BryntumCampaign.astro) so its generic `.b-*` rules don't leak onto
// other product demos that render the same Bryntum classes.
export const LIVE_DEMO_PRODUCT_CONFIG: Record<string, { mountId: string; demoCss?: string }> = {
    gantt: { mountId: 'live-gantt-demo' },
    scheduler: { mountId: 'live-scheduler-demo', demoCss: '/styles/bryntum-scheduler-demo.css' },
    schedulerpro: { mountId: 'live-schedulerpro-demo' },
    taskboard: { mountId: 'live-taskboard-demo' },
};

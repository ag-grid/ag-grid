import ganttDemoUrl from './assets/bryntum-gantt-demo.js?url&no-inline';
import schedulerDemoCssUrl from './assets/bryntum-scheduler-demo.css?url&no-inline';
import schedulerDemoUrl from './assets/bryntum-scheduler-demo.js?url&no-inline';
import schedulerProDemoUrl from './assets/bryntum-schedulerpro-demo.js?url&no-inline';
import taskboardDemoCssUrl from './assets/bryntum-taskboard-demo.css?url&no-inline';
import taskboardDemoUrl from './assets/bryntum-taskboard-demo.js?url&no-inline';

// `scriptUrl` and `demoCss` are imported with `?url&no-inline` so the build emits
// them under /_astro/ with a content hash in the filename, and a deploy that
// changes one can't be paired with a stale cached copy. `no-inline` stops Vite
// turning files under its 4 KB inline limit into data: URLs, which the CSP
// blocks for scripts.
//
// `demoCss` is a per-product stylesheet ported from the upstream Bryntum
// example's app.css. It is loaded only when that product's live demo is on the
// page (see BryntumCampaign.astro) so its generic `.b-*` rules don't leak onto
// other product demos that render the same Bryntum classes.
export const LIVE_DEMO_PRODUCT_CONFIG: Record<string, { mountId: string; scriptUrl: string; demoCss?: string }> = {
    gantt: { mountId: 'live-gantt-demo', scriptUrl: ganttDemoUrl },
    scheduler: { mountId: 'live-scheduler-demo', scriptUrl: schedulerDemoUrl, demoCss: schedulerDemoCssUrl },
    schedulerpro: { mountId: 'live-schedulerpro-demo', scriptUrl: schedulerProDemoUrl },
    taskboard: { mountId: 'live-taskboard-demo', scriptUrl: taskboardDemoUrl, demoCss: taskboardDemoCssUrl },
};

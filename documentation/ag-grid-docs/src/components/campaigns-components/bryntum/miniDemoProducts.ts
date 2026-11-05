import calendarMiniDemoUrl from '../../../../public/scripts/bryntum-calendar-mini-demo.js?url&no-inline';
import ganttMiniDemoUrl from '../../../../public/scripts/bryntum-gantt-mini-demo.js?url&no-inline';

export interface MiniDemoConfig {
    productSlug: string;
    mountId: string;
    scriptUrl: string;
}

export const MINI_DEMO_CONFIG: Record<string, MiniDemoConfig> = {
    gantt: {
        productSlug: 'gantt',
        mountId: 'live-gantt-mini-demo',
        scriptUrl: ganttMiniDemoUrl,
    },
    calendar: {
        productSlug: 'calendar',
        mountId: 'live-calendar-mini-demo',
        scriptUrl: calendarMiniDemoUrl,
    },
};

export interface MiniDemoConfig {
    productSlug: string;
    mountId: string;
    scriptPath: string;
}

export const MINI_DEMO_CONFIG: Record<string, MiniDemoConfig> = {
    gantt: {
        productSlug: 'gantt',
        mountId: 'live-gantt-mini-demo',
        scriptPath: '/scripts/bryntum-gantt-mini-demo.js',
    },
    calendar: {
        productSlug: 'calendar',
        mountId: 'live-calendar-mini-demo',
        scriptPath: '/scripts/bryntum-calendar-mini-demo.js',
    },
};

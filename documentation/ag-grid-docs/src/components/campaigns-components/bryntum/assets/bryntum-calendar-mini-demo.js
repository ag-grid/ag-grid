/* global bryntumDemoInit */
// Small embedded Bryntum Calendar for the campaign page's "Live Demo" section.
// Bootstrap helper (mount, namespace, init guard, ready-state) lives in
// bryntum-demo-bootstrap.js.
//
// The upstream snippet this is based on loads events via a crudManager that
// fetches `/data/calendar-data.json`. We don't host that endpoint on
// ag-grid.com, so the demo uses an inline events array instead — same shape,
// no network dependency.

bryntumDemoInit('calendar', 'live-calendar-mini-demo', function (api) {
    const { Calendar } = api;

    new Calendar({
        appendTo: 'live-calendar-mini-demo',
        date: new Date(2024, 8, 2),
        sidebar: false,
        hideNonWorkingDays: true,
        mode: 'week',
        events: [
            { id: 1, name: 'Sprint planning', startDate: '2024-09-02T09:30', endDate: '2024-09-02T10:30' },
            { id: 2, name: 'Design review', startDate: '2024-09-02T14:00', endDate: '2024-09-02T15:00' },
            { id: 3, name: '1:1 with PM', startDate: '2024-09-03T11:00', endDate: '2024-09-03T11:30' },
            { id: 4, name: 'Lunch with team', startDate: '2024-09-03T12:30', endDate: '2024-09-03T13:30' },
            { id: 5, name: 'Architecture sync', startDate: '2024-09-04T10:00', endDate: '2024-09-04T11:30' },
            { id: 6, name: 'Customer demo', startDate: '2024-09-05T15:00', endDate: '2024-09-05T16:00' },
            { id: 7, name: 'Retrospective', startDate: '2024-09-06T14:00', endDate: '2024-09-06T15:00' },
        ],
    });
});

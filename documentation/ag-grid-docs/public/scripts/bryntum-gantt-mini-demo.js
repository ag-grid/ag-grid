/* global bryntumDemoInit */
// Small embedded Bryntum Gantt for the "World's Most Flexible JS Gantt Chart"
// and "Live Demo" sections. Bootstrap helper (mount, namespace, init guard,
// ready-state) lives in bryntum-demo-bootstrap.js.

bryntumDemoInit('gantt', 'live-gantt-mini-demo', function (api) {
    const { Gantt } = api;

    new Gantt({
        appendTo: 'live-gantt-mini-demo',
        columnLines: true,
        columns: [{ type: 'name', width: 250 }],
        tickSize: 30,
        tasks: [
            {
                id: 1,
                name: 'Go to Mars',
                startDate: '2030-02-28',
                expanded: true,
                children: [
                    { id: 2, name: 'Astronaut academy', percentDone: 50, duration: 3 },
                    { id: 3, name: 'Make space suit', percentDone: 50, duration: 3 },
                    { id: 4, name: 'Wait for Elon´s call', duration: 0, eventColor: 'orange' },
                ],
            },
        ],
        dependencies: [
            { from: 2, to: 3 },
            { from: 3, to: 4, lag: 2 },
        ],
    });
});

/* global bryntumDemoInit */
// Bryntum Task Board "Try it yourself!" demo — UMD port of
// https://bryntum.com/demos/live/taskboard/zooming/app.js
// Bootstrap lives in bryntum-demo-bootstrap.js.

bryntumDemoInit('taskboard', 'live-taskboard-demo', function (api) {
    const { TaskBoard } = api;

    new TaskBoard({
        appendTo: 'live-taskboard-demo',
        height: '55em',
        columnField: 'status',
        resourceImagePath: 'https://bryntum.com/dist/taskboard/examples/_shared/images/transparent-users/',
        useDomTransition: true,
        chainFilters: true,

        columns: [
            { id: 'todo', text: 'Todo', color: 'orange' },
            { id: 'doing', text: 'Doing', color: 'blue', tooltip: 'Items that are currently in progress' },
            { id: 'done', text: 'Done', color: 'green' },
        ],

        features: {
            columnDrag: true,
            columnToolbars: true,
        },

        tbar: [
            { type: 'label', text: 'Zoom level', style: 'margin-left:.5em' },
            { type: 'zoomslider', min: 3, text: '' },
            { type: 'taskfilterfield', style: 'margin-left:2em' },
        ],

        footerItems: {
            tags: { type: 'tags', order: 1, style: 'flex:1' },
            resourceAvatars: { order: 2 },
        },

        project: {
            tasks: [
                { id: 1, name: 'Book flight', status: 'done', tags: 'medium', resourceId: 1 },
                { id: 2, name: 'Book hotel', status: 'done', tags: 'medium', resourceId: 2 },
                { id: 3, name: 'Find best Kanban board widget', status: 'doing', tags: 'high', resourceId: 3 },
                { id: 4, name: 'Get visa', status: 'doing', tags: 'high', resourceId: 3 },
                { id: 5, name: 'Book train', status: 'done', tags: 'medium', resourceId: 4 },
                { id: 6, name: 'Go to airport', status: 'todo', tags: 'low', resourceId: 5 },
                { id: 7, name: 'Renew passport', status: 'todo', tags: 'high', resourceId: 7 },
                { id: 8, name: 'Swim in pool', status: 'todo', tags: 'medium', resourceId: 6 },
                { id: 9, name: 'Scuba diving', status: 'todo', tags: 'medium', resourceId: 8 },
                { id: 10, name: 'Canyoning', status: 'todo', tags: 'low', resourceId: 9 },
                { id: 11, name: 'Snorkeling', status: 'doing', tags: 'medium', resourceId: 10 },
                { id: 12, name: 'Diving license', status: 'todo', tags: 'medium', resourceId: 1 },
                { id: 13, name: 'Book cab', status: 'done', tags: 'low', resourceId: 1 },
                { id: 14, name: 'Write postcards', status: 'todo', tags: 'medium', resourceId: 3 },
                { id: 15, name: 'Take pictures', status: 'todo', tags: 'low', resourceId: 2 },
                { id: 16, name: 'Take selfies', status: 'todo', tags: 'high', resourceId: 5 },
                { id: 17, name: 'Post on instagram', status: 'todo', tags: 'medium', resourceId: 6 },
                { id: 18, name: 'Call grandma', status: 'todo', tags: 'medium', resourceId: 11 },
                { id: 19, name: 'Buy swimming ring', status: 'done', tags: 'high', resourceId: 2 },
                { id: 20, name: 'Get in shape', status: 'doing', tags: 'medium', resourceId: 9 },
                { id: 21, name: 'Iron shirts', status: 'done', tags: 'low', resourceId: 3 },
            ],

            resources: [
                { id: 1, name: 'Angelo', image: 'angelo.png' },
                { id: 2, name: 'Celia', image: 'celia.png' },
                { id: 3, name: 'Dave', image: 'dave.png' },
                { id: 4, name: 'Emilia', image: 'emilia.png' },
                { id: 5, name: 'Gloria', image: 'gloria.png' },
                { id: 6, name: 'Henrik', image: 'henrik.png' },
                { id: 7, name: 'Kate', image: 'kate.png' },
                { id: 8, name: 'Lee', image: 'lee.png' },
                { id: 9, name: 'Lisa', image: 'lisa.png' },
                { id: 10, name: 'Mark', image: 'mark.png' },
                { id: 11, name: 'Steve', image: 'steve.png' },
            ],
        },
    });
});

/* global bryntumDemoInit */
// Bryntum Scheduler Pro "Try it yourself!" demo — UMD port of
// https://bryntum.com/demos/live/schedulerpro/grouping/app.js
// Bootstrap lives in bryntum-demo-bootstrap.js.

bryntumDemoInit('schedulerpro', 'live-schedulerpro-demo', function (api) {
    const { SchedulerPro, Toast } = api;

    const schedulerPro = new SchedulerPro({
        project: {
            autoLoad: true,
            loadUrl: 'https://bryntum.com/demos/live/schedulerpro/grouping/data.json',
        },

        style: 'width:100%;margin:1em auto;height:48em',
        adopt: 'live-schedulerpro-demo',
        resourceImagePath: 'https://bryntum.com/examples/schedulerpro-next/_shared/images/transparent-users/',
        eventStyle: 'rounded',
        startDate: '2020-03-23T02:00:00',
        endDate: '2020-03-26',
        viewPreset: {
            base: 'hourAndDay',
            tickWidth: 27,
            headers: [
                { unit: 'day', dateFormat: 'ddd DD/MM' },
                { unit: 'hour', dateFormat: 'H' },
            ],
        },

        features: {
            timeRanges: { narrowThreshold: 10, enableResizing: true },
            resourceNonWorkingTime: true,
            cellEdit: true,
            filter: true,
            regionResize: true,
            dependencies: true,
            dependencyEdit: true,
            percentBar: true,
            group: 'type',
            sort: 'name',
            eventTooltip: {
                header: { title: 'Information', titleAlign: 'start' },
                tools: [
                    {
                        cls: 'fa fa-trash',
                        handler() {
                            this.eventRecord.remove();
                            this.hide();
                        },
                    },
                    {
                        cls: 'fa fa-edit',
                        handler() {
                            schedulerPro.editEvent(this.eventRecord);
                        },
                    },
                ],
            },
        },

        responsiveLevels: {
            small: 850,
            large: '*',
        },

        columns: [
            { type: 'resourceInfo', text: 'Name', showEventCount: true, width: 220 },
            {
                type: 'resourceCalendar',
                text: 'Shift',
                width: 120,
                responsiveLevels: {
                    small: { hidden: true },
                    '*': { hidden: false },
                },
            },
            {
                type: 'action',
                text: 'Actions',
                align: 'center',
                width: 80,
                actions: [
                    {
                        cls: 'fa fa-fw fa-plus',
                        tooltip: 'Add task',
                        onClick: async ({ record }) => {
                            await schedulerPro.project.addEvent({
                                name: 'New task',
                                startDate: schedulerPro.startDate,
                                duration: 4,
                                durationUnit: 'h',
                                resourceId: record.id,
                            });
                            schedulerPro.editEvent(schedulerPro.eventStore.last);
                        },
                    },
                    {
                        cls: 'fa fa-fw fa-cog',
                        tooltip: 'Settings',
                        onClick: () => Toast.show('TODO: Show a cool settings dialog'),
                    },
                ],
            },
        ],
    });
});

/* global bryntumDemoInit */
// Bryntum Scheduler "Try it yourself!" demo — UMD port of
// https://bryntum.com/demos/live/scheduler/drag-from-grid/app.module.js
// Bootstrap lives in bryntum-demo-bootstrap.js.

bryntumDemoInit('scheduler', 'live-scheduler-demo', function (api) {
    const {
        ResourceModel,
        DateHelper,
        DragHelper,
        DomHelper,
        Toast,
        Tooltip,
        Combo,
        Scheduler,
        StringHelper,
        EventModel,
        Grid,
        Splitter,
    } = api;

    class CustomResource extends ResourceModel {
        static $name = 'CustomResource';
        static fields = [{ name: 'cls', persist: false }];

        get nbrAssignedEvents() {
            return this.events.length;
        }
    }

    class Drag extends DragHelper {
        static configurable = {
            callOnFunctions: true,
            cloneTarget: true,
            autoSizeClonedTarget: false,
            dropTargetSelector: '.b-schedule',
            targetSelector: '.b-sch-event-wrap',
        };

        afterConstruct() {
            this.scrollManager = this.schedule.scrollManager;
        }

        createProxy(element) {
            const proxy = element.cloneNode(true);
            const { schedule } = this;
            const task = this.grid.getRecordFromElement(element);
            const durationInPx = schedule.timeAxisViewModel.getDistanceForDuration(task.rawDurationMS);

            proxy.classList.add('b-color-green', 'b-unassigned-class', `b-sch-${schedule.mode}`);

            if (schedule.isHorizontal) {
                proxy.style.height = `${schedule.rowHeight - 2 * schedule.resourceMargin}px`;
                proxy.style.width = `${durationInPx}px`;
            } else {
                proxy.style.height = `${durationInPx}px`;
                proxy.style.width = `${schedule.resourceColumnWidth}px`;
            }

            return proxy;
        }

        onDragStart({ context }) {
            const me = this;
            const { schedule } = me;
            const { eventTooltip, eventDrag } = schedule.features;

            context.task = me.grid.getRecordFromElement(context.grabbed);
            eventTooltip.disabled = true;
            schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

            if (eventDrag.showTooltip && !me.tip) {
                me.tip = new Tooltip({
                    align: 'b-t',
                    rootElement: document.body,
                    forElement: context.element,
                    cls: 'b-popup b-sch-event-tooltip',
                });
            }
        }

        onDrag({ context }) {
            const me = this;
            const { schedule } = me;
            const { task, target, enteredSchedule } = context;
            const isOverSchedule = target?.closest('.b-time-axis-sub-grid');
            let valid = !enteredSchedule;

            if (isOverSchedule) {
                const coordinate = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element);
                const startDate = schedule.getDateFromCoordinate(coordinate, 'round', false, true);
                const endDate = startDate && DateHelper.add(startDate, task.duration, task.durationUnit);
                const resource = target && schedule.resolveResourceRecord(target);

                context.enteredSchedule = true;
                valid =
                    Boolean(startDate && resource) &&
                    (schedule.allowOverlap || schedule.isDateRangeAvailable(startDate, endDate, null, resource));
                context.resource = resource;
                context.startDate = startDate;

                if (me.tip) {
                    const dateFormat = schedule.displayDateFormat;
                    const formattedStartDate = DateHelper.format(startDate, dateFormat);
                    const formattedEndDate = DateHelper.format(endDate, dateFormat);
                    me.tip.html = `
                            <div class="b-sch-event-title">${task.name}</div>
                            <div class="b-sch-tooltip-start-date">Starts: ${formattedStartDate}</div>
                            <div class="b-sch-tooltip-end-date">Ends: ${formattedEndDate}</div>
                        `;
                    me.tip.showBy(context.element);
                }
            } else {
                me.tip?.hide();
            }
            context.valid = valid;
        }

        onDrop({ context }) {
            const me = this;
            const { schedule } = me;
            const { task, target, resource, valid, element, startDate } = context;
            me.tip?.hide();
            schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);
            context.valid = valid && target && startDate;

            if (context.valid) {
                const targetEventRecord = schedule.resolveEventRecord(target);
                me.grid.store.remove(task);
                task.startDate = startDate;
                task.assign(resource);
                schedule.eventStore.add(task);
                if (targetEventRecord) {
                    Toast.show(`Dropped on ${targetEventRecord.name}`);
                }
            }
            if (resource) {
                resource.cls = '';
            }
            schedule.features.eventTooltip.disabled = false;
        }

        set schedule(schedule) {
            this._schedule = schedule;
            this.scrollManager = schedule.scrollManager;
        }

        get schedule() {
            return this._schedule;
        }

        onAbort() {
            this.tip?.hide();
        }
    }

    class IconCombo extends Combo {
        static type = 'iconcombo';
        static configurable = {
            items: [
                { value: 'fa fa-asterisk', text: 'Asterisk' },
                { value: 'fa fa-fw fa-beer', text: 'Beer' },
                { value: 'fa fa-fw fa-book', text: 'Book' },
                { value: 'fa fa-fw fa-bug', text: 'Bug' },
                { value: 'fa fa-building', text: 'Building' },
                { value: 'fa fa-coffee', text: 'Coffee' },
                { value: 'fa fa-fw fa-cog', text: 'Cog' },
                { value: 'fa fa-fw fa-dumbbell', text: 'Dumbbell' },
                { value: 'fa fa-laptop', text: 'Laptop' },
                { value: 'fa fa-fw fa-plane', text: 'Plane' },
                { value: 'fa fa-fw fa-phone', text: 'Phone' },
                { value: 'fa fa-fw fa-question', text: 'Question' },
                { value: 'fa fa-fw fa-life-ring', text: 'Ring' },
                { value: 'fa fa-sync', text: 'Sync' },
                { value: 'fa fa-user', text: 'User' },
                { value: 'fa fa-users', text: 'Users' },
                { value: 'fa fa-video', text: 'Video' },
            ],
            listItemTpl: (item) => `<i class="${item.value}" style="margin-right: .5em"></i>${item.text}`,
        };

        syncInputFieldValue(...args) {
            this.icon.className = this.value;
            super.syncInputFieldValue(...args);
        }

        get innerElements() {
            return [
                {
                    reference: 'icon',
                    tag: 'i',
                    className: 'fa fa-cog',
                    style: { marginLeft: '.8em', marginRight: '-.3em' },
                },
                ...super.innerElements,
            ];
        }
    }

    IconCombo.initClass();

    class Schedule extends Scheduler {
        static get $name() {
            return 'Schedule';
        }
        static get type() {
            return 'schedule';
        }

        static get configurable() {
            return {
                autoRescheduleTasks: false,
                eventStyle: 'colored',
                rowHeight: 72,
                barMargin: 8,
                eventColor: 'indigo',
                subGridConfigs: {
                    locked: { width: 300 },
                    normal: { flex: 1 },
                },
                features: {
                    stripe: true,
                    timeRanges: true,
                    stickyEvents: false,
                    eventMenu: {
                        items: {
                            unassign: {
                                text: 'Unassign',
                                icon: 'fa fa-user-times',
                                weight: 200,
                                onItem: ({ eventRecord }) => eventRecord.unassign(),
                            },
                        },
                    },
                    eventEdit: {
                        items: {
                            iconCls: {
                                type: 'iconcombo',
                                name: 'icon',
                                label: 'Icon',
                                weight: 200,
                            },
                        },
                    },
                },
                columns: [
                    {
                        type: 'resourceInfo',
                        text: 'Name',
                        flex: 1,
                        showEventCount: false,
                        showRole: true,
                    },
                    {
                        text: 'Nbr tasks',
                        editor: false,
                        width: 100,
                        align: 'center',
                        field: 'nbrAssignedEvents',
                    },
                ],
                viewPreset: {
                    base: 'hourAndDay',
                    columnLinesFor: 0,
                    headers: [
                        { unit: 'd', align: 'center', dateFormat: 'ddd DD MMM' },
                        { unit: 'h', align: 'center', dateFormat: 'HH' },
                    ],
                },
                resourceColumns: {
                    columnWidth: 120,
                },
                removeUnassignedEvent: false,
            };
        }

        updateAutoRescheduleTasks(autoRescheduleTasks) {
            this.eventStore.autoRescheduleTasks = autoRescheduleTasks;
        }

        eventRenderer({ eventRecord }) {
            return StringHelper.xss`
                    <div class="b-event-header"><span>${eventRecord.name}</span><i class="${eventRecord.icon}"></i></div>
                    <div class="b-event-footer"><span class="b-meta">${eventRecord.note}</span></div>
                `;
        }
    }

    Schedule.initClass();

    class Task extends EventModel {
        static $name = 'Task';
        static fields = [{ name: 'icon', defaultValue: 'fa fa-asterisk' }];
        static defaults = {
            durationUnit: 'h',
            name: 'New event',
        };

        get eventStartEndTimeString() {
            return `${DateHelper.format(this.startDate, 'LT')}`;
        }
    }

    class UnplannedGrid extends Grid {
        static $name = 'UnplannedGrid';
        static type = 'unplannedgrid';

        static get configurable() {
            return {
                rowHeight: 80,
                readOnly: true,
                rowLines: false,
                features: { sort: 'name' },
                columns: [
                    {
                        type: 'template',
                        text: 'Tasks',
                        flex: 1,
                        field: 'name',
                        htmlEncode: false,
                        minWidth: 200,
                        template: ({ record: eventRecord }) => StringHelper.xss`
                                <div class="b-sch-event-wrap b-style-indented b-colorize b-color-none">
                                    <div class="b-sch-event">
                                        <div class="b-sch-event-content">
                                            <div class="b-event-header"><span>${eventRecord.isPhantom ? '#' : eventRecord.id} ${eventRecord.name}</span></div>
                                            <div class="b-event-footer"><span class="b-meta">${eventRecord.note}</span><span>${eventRecord.duration} ${eventRecord.durationUnit}</span></div>
                                        </div>
                                    </div>
                                </div>
                            `,
                    },
                ],
            };
        }
    }

    UnplannedGrid.initClass();

    const schedule = new Schedule({
        ref: 'schedule',
        insertFirst: 'live-scheduler-demo',
        startDate: new Date(2025, 11, 1, 8),
        endDate: new Date(2025, 11, 1, 18),
        flex: 4,
        resourceImagePath: 'https://bryntum.com/examples/scheduler-next/_shared/images/transparent-users/',
        crudManager: {
            autoLoad: true,
            validateResponse: true,
            eventStore: { modelClass: Task },
            resourceStore: { modelClass: CustomResource },
            transport: {
                load: {
                    url: 'https://bryntum.com/demos/live/scheduler/drag-from-grid/data.json',
                },
            },
        },
        tbar: ['Schedule view'],
    });

    new Splitter({ appendTo: 'live-scheduler-demo' });

    const unplannedGrid = new UnplannedGrid({
        ref: 'unplanned',
        appendTo: 'live-scheduler-demo',
        title: 'Unplanned Tasks',
        collapsible: true,
        flex: '0 0 300px',
        ui: 'toolbar',
        hideHeaders: true,
        project: schedule.project,
        store: {
            modelClass: Task,
            reapplySortersOnAdd: true,
            readUrl: 'https://bryntum.com/demos/live/scheduler/drag-from-grid/unplanned.json',
            autoLoad: true,
        },
    });

    new Drag({
        grid: unplannedGrid,
        schedule,
        constrain: false,
        outerElement: unplannedGrid.element,
    });

    schedule.assignmentStore.on({
        remove({ records }) {
            records.forEach(({ event }) => {
                schedule.eventStore.remove(event);
                unplannedGrid.store.add(event);
            });
        },
    });
});

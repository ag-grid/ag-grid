/* global bryntumDemoInit */
// Bryntum Gantt "Try it yourself!" demo — UMD port of
// https://bryntum.com/demos/live/gantt/advanced/app.module.js
// Bootstrap lives in bryntum-demo-bootstrap.js.

bryntumDemoInit('gantt', 'live-gantt-demo', function (api) {
    const { Toolbar, Toast, CSSHelper, ColumnStore, Column, Gantt, ProjectModel } = api;

    class GanttToolbar extends Toolbar {
        static get type() {
            return 'gantttoolbar';
        }

        static get $name() {
            return 'GanttToolbar';
        }

        static get configurable() {
            return {
                items: [
                    {
                        type: 'buttonGroup',
                        items: [
                            {
                                color: 'b-green',
                                ref: 'addTaskButton',
                                icon: 'fa fa-plus',
                                text: 'Create',
                                tooltip: 'Create new task',
                                onAction: 'up.onAddTaskClick',
                            },
                        ],
                    },
                    {
                        ref: 'undoRedo',
                        type: 'undoredo',
                        items: { transactionsCombo: null },
                    },
                    {
                        type: 'buttonGroup',
                        items: [
                            {
                                ref: 'expandAllButton',
                                icon: 'fa fa-angle-double-down',
                                tooltip: 'Expand all',
                                onAction: 'up.onExpandAllClick',
                            },
                            {
                                ref: 'collapseAllButton',
                                icon: 'fa fa-angle-double-up',
                                tooltip: 'Collapse all',
                                onAction: 'up.onCollapseAllClick',
                            },
                        ],
                    },
                    {
                        type: 'buttonGroup',
                        items: [
                            {
                                ref: 'zoomInButton',
                                icon: 'fa fa-search-plus',
                                tooltip: 'Zoom in',
                                onAction: 'up.onZoomInClick',
                            },
                            {
                                ref: 'zoomOutButton',
                                icon: 'fa fa-search-minus',
                                tooltip: 'Zoom out',
                                onAction: 'up.onZoomOutClick',
                            },
                            {
                                ref: 'zoomToFitButton',
                                icon: 'fa fa-compress-arrows-alt',
                                tooltip: 'Zoom to fit',
                                onAction: 'up.onZoomToFitClick',
                            },
                            {
                                ref: 'previousButton',
                                icon: 'fa fa-angle-left',
                                tooltip: 'Previous time span',
                                onAction: 'up.onShiftPreviousClick',
                            },
                            {
                                ref: 'nextButton',
                                icon: 'fa fa-angle-right',
                                tooltip: 'Next time span',
                                onAction: 'up.onShiftNextClick',
                            },
                        ],
                    },
                    '->',
                    {
                        type: 'textfield',
                        ref: 'filterByName',
                        cls: 'filter-by-name',
                        flex: '0 0 15em',
                        label: 'Filter tasks...',
                        placeholder: 'Find tasks by name',
                        clearable: true,
                        keyStrokeChangeDelay: 100,
                        triggers: {
                            filter: { align: 'end', cls: 'fa fa-filter' },
                        },
                        onChange: 'up.onFilterChange',
                    },
                    {
                        type: 'button',
                        ref: 'featuresButton',
                        icon: 'fa fa-tasks',
                        text: 'Settings',
                        tooltip: 'Toggle features',
                        toggleable: true,
                        menu: {
                            onItem: 'up.onFeaturesClick',
                            onBeforeShow: 'up.onFeaturesShow',
                            items: [
                                {
                                    text: 'UI settings',
                                    icon: 'fa-sliders-h',
                                    menu: {
                                        type: 'popup',
                                        anchor: true,
                                        cls: 'settings-menu',
                                        layoutStyle: { flexDirection: 'column' },
                                        onBeforeShow: 'up.onSettingsShow',
                                        items: [
                                            {
                                                type: 'slider',
                                                ref: 'rowHeight',
                                                text: 'Row height',
                                                width: '12em',
                                                showValue: true,
                                                min: 30,
                                                max: 70,
                                                onInput: 'up.onRowHeightChange',
                                            },
                                            {
                                                type: 'slider',
                                                ref: 'barMargin',
                                                text: 'Bar margin',
                                                width: '12em',
                                                showValue: true,
                                                min: 0,
                                                max: 10,
                                                onInput: 'up.onBarMarginChange',
                                            },
                                            {
                                                type: 'slider',
                                                ref: 'duration',
                                                text: 'Animation duration ',
                                                width: '12em',
                                                min: 0,
                                                max: 2000,
                                                step: 100,
                                                showValue: true,
                                                onInput: 'up.onAnimationDurationChange',
                                            },
                                        ],
                                    },
                                },
                                { text: 'Draw dependencies', feature: 'dependencies', checked: false },
                                { text: 'Task labels', feature: 'labels', checked: false },
                                {
                                    text: 'Critical paths',
                                    feature: 'criticalPaths',
                                    tooltip: 'Highlight critical paths',
                                    checked: false,
                                },
                                { text: 'Project lines', feature: 'projectLines', checked: false },
                                { text: 'Highlight non-working time', feature: 'nonWorkingTime', checked: false },
                                { text: 'Enable cell editing', feature: 'cellEdit', checked: false },
                                { text: 'Show baselines', feature: 'baselines', checked: false },
                                { text: 'Show rollups', feature: 'rollups', checked: false },
                                { text: 'Show progress line', feature: 'progressLine', checked: false },
                                {
                                    text: 'Hide schedule',
                                    cls: 'b-separator',
                                    subGrid: 'normal',
                                    checked: false,
                                },
                            ],
                        },
                    },
                ],
            };
        }

        updateParent(parent, was) {
            super.updateParent(parent, was);
            this.gantt = parent;
            this.styleNode = document.createElement('style');
            document.head.appendChild(this.styleNode);
        }

        setAnimationDuration(value) {
            const me = this;
            const cssText = `.b-animating .b-gantt-task-wrap { transition-duration: ${value / 1000}s !important; }`;
            me.gantt.transitionDuration = value;
            if (me.transitionRule) {
                me.transitionRule.cssText = cssText;
            } else {
                me.transitionRule = CSSHelper.insertRule(cssText);
            }
        }

        async onAddTaskClick() {
            const { gantt } = this;
            const added = gantt.taskStore.rootNode.appendChild({ name: this.L('New task'), duration: 1 });
            await gantt.project.propagateAsync();
            await gantt.scrollRowIntoView(added);
            gantt.features.cellEdit.startEditing({ record: added, field: 'name' });
        }

        onEditTaskClick() {
            const { gantt } = this;
            if (gantt.selectedRecord) {
                gantt.editTask(gantt.selectedRecord);
            } else {
                Toast.show(this.L('First select the task you want to edit'));
            }
        }

        onExpandAllClick() {
            this.gantt.expandAll();
        }
        onCollapseAllClick() {
            this.gantt.collapseAll();
        }
        onZoomInClick() {
            this.gantt.zoomIn();
        }
        onZoomOutClick() {
            this.gantt.zoomOut();
        }
        onZoomToFitClick() {
            this.gantt.zoomToFit({ leftMargin: 50, rightMargin: 50 });
        }
        onShiftPreviousClick() {
            this.gantt.shiftPrevious();
        }
        onShiftNextClick() {
            this.gantt.shiftNext();
        }

        onFilterChange({ value }) {
            if (value === '') {
                this.gantt.taskStore.clearFilters();
            } else {
                value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                this.gantt.taskStore.filter({
                    filters: (task) => task.name && task.name.match(new RegExp(value, 'i')),
                    replace: true,
                });
            }
        }

        onFeaturesClick({ source: item }) {
            const { gantt } = this;
            if (item.feature) {
                const feature = gantt.features[item.feature];
                feature.disabled = !feature.disabled;
            } else if (item.subGrid) {
                const subGrid = gantt.subGrids[item.subGrid];
                subGrid.collapsed = !subGrid.collapsed;
            }
        }

        onFeaturesShow({ source: menu }) {
            const { gantt } = this;
            menu.items.map((item) => {
                const { feature } = item;
                if (feature) {
                    if (gantt.features[feature]) {
                        item.checked = !gantt.features[feature].disabled;
                    } else {
                        item.hide();
                    }
                } else if (item.subGrid) {
                    item.checked = gantt.subGrids[item.subGrid].collapsed;
                }
            });
        }

        onSettingsShow({ source: menu }) {
            const { gantt } = this;
            const { rowHeight, barMargin, duration } = menu.widgetMap;
            rowHeight.value = gantt.rowHeight;
            barMargin.value = gantt.barMargin;
            barMargin.max = gantt.rowHeight / 2 - 5;
            duration.value = gantt.transitionDuration;
        }

        onRowHeightChange({ value, source }) {
            this.gantt.rowHeight = value;
            source.owner.widgetMap.barMargin.max = value / 2 - 5;
        }

        onBarMarginChange({ value }) {
            this.gantt.barMargin = value;
        }

        onAnimationDurationChange({ value }) {
            this.gantt.transitionDuration = value;
            this.styleNode.innerHTML = `.b-animating .b-gantt-task-wrap { transition-duration: ${value / 1000}s !important; }`;
        }

        onCriticalPathsClick({ source }) {
            this.gantt.features.criticalPaths.disabled = !source.pressed;
        }
    }

    class StatusColumn extends Column {
        static get type() {
            return 'statuscolumn';
        }
        static get isGanttColumn() {
            return true;
        }
        static get defaults() {
            return { text: 'Status', htmlEncode: false, editor: false };
        }

        renderer({ record }) {
            let status = '';
            if (record.isCompleted) {
                status = 'Completed';
            } else if (record.endDate > Date.now()) {
                status = 'Late';
            } else if (record.isStarted) {
                status = 'Started';
            }
            return status ? `<i class="fa fa-circle ${status}"></i>${status}` : '';
        }
    }

    ColumnStore.registerColumnType(StatusColumn);

    const project = new ProjectModel({
        transport: {
            load: {
                url: 'https://bryntum.com/dist/gantt/examples/_datasets/launch-saas.json',
                credentials: 'omit',
            },
        },
    });

    GanttToolbar.initClass();

    const gantt = new Gantt({
        project: project,
        adopt: 'live-gantt-demo',
        tbar: { type: 'gantttoolbar' },
        startDate: '2019-01-12',
        endDate: '2019-03-24',
        resourceImagePath: '//bryntum.com/dist/gantt-next/examples/_shared/images/users/',
        columns: [
            { type: 'wbs' },
            { type: 'name', width: 250 },
            { type: 'startdate' },
            { type: 'duration' },
            { type: 'resourceassignment', width: 120, showAvatars: true },
            { type: 'percentdone', mode: 'circle', width: 70 },
            { type: 'predecessor', width: 112 },
            { type: 'successor', width: 112 },
            { type: 'schedulingmodecolumn' },
            { type: 'calendar' },
            { type: 'constrainttype' },
            { type: 'constraintdate' },
            { type: 'date', text: 'Deadline', field: 'deadline' },
            { type: 'addnew' },
        ],
        subGridConfigs: {
            locked: { flex: 3 },
            normal: { flex: 4 },
        },
        columnLines: false,
        features: {
            baselines: { disabled: true },
            progressLine: { disabled: true, statusDate: new Date(2019, 0, 25) },
            taskMenu: {
                items: { convertToMilestone: true },
                processItems({ taskRecord, items }) {
                    if (taskRecord.isMilestone) {
                        items.convertToMilestone = false;
                    }
                },
            },
            filter: true,
            nonWorkingTime: true,
            dependencyEdit: true,
            timeRanges: { showCurrentTimeLine: true },
            labels: {
                left: { field: 'name', editor: { type: 'textfield' } },
            },
        },
    });

    project
        .load()
        .then(() => {
            const stm = gantt.project.stm;
            stm.enable();
            stm.autoRecord = true;
        })
        .catch((err) => {
            // Data fetch from bryntum.com failed (offline, CDN/path change, or
            // CSP block). Warn rather than leaving an unexplained empty Gantt.
            console.warn('[bryntum-demo] Gantt data failed to load:', err);
        });
});

/* global bryntumDemoInit */
// Bryntum Grid "Try it yourself!" demo — UMD port of
// https://bryntum.com/demos/live/grid/project-summary/app.module.js
// Bootstrap (mount, namespace, init guard, ready-state) lives in
// bryntum-demo-bootstrap.js.

bryntumDemoInit('grid', 'live-grid-projectdemo', function (api) {
    const { AjaxStore, DateHelper, Tooltip, Grid } = api;

    const formatUSD = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format;

    // Project + member data is fetched live from bryntum.com on every visit.
    // We deliberately use the upstream demo dataset so the example stays in
    // sync with the canonical Bryntum demo; if bryntum.com is unreachable the
    // grid renders empty with a console error from AjaxStore.
    const memberStore = new AjaxStore({
        sorters: ['name'],
        readUrl: 'https://bryntum.com/demos/live/grid/project-summary/data/members.json',
    });

    const statuses = ['Not started', 'In progress', 'Paused', 'Reviewing', 'Completed'];
    const statusColors = ['red', 'gray', 'blue', 'yellow', 'light-blue', 'green'];

    const getAvatars = (id) => {
        const member = typeof id === 'number' ? memberStore.find((m) => m.id === id) : id;
        return member
            ? {
                  class: 'avatar',
                  elementData: member,
                  style: `--background: url(https://bryntum.com/dist/grid/examples/_shared/images/transparent-users/${member.photo})`,
              }
            : '';
    };

    const grid = new Grid({
        appendTo: 'live-grid-projectdemo',
        height: '41em',
        // Suppress Bryntum's runtime CSS-compatibility check: the embedded
        // Bryntum CSS is loaded from bryntum.com alongside the UMD, so the
        // check produces false positives in this cross-origin embedding.
        detectCSSCompatibilityIssues: false,

        selectionMode: {
            cell: false,
            checkbox: true,
            showCheckAll: true,
        },

        features: {
            cellEdit: true,
            filterBar: {
                compactMode: true,
            },
        },

        rowHeight: 55,
        columnLines: false,

        columns: [
            {
                text: 'Project',
                field: 'project',
                ref: 'projectFilter',
                flex: '1 1 18em',
                renderer({ record }) {
                    return [
                        {
                            tag: 'i',
                            className: `fa fa-fw fa-${record.icon || 'question'} category-icon`,
                        },
                        record.project,
                        {
                            className: 'location',
                            text: record.location,
                        },
                    ];
                },
            },
            {
                text: 'Status',
                field: 'status',
                ref: 'statusFilter',
                width: 140,
                renderer({ value, row }) {
                    const clsAction = value === 'Completed' ? 'addCls' : 'removeCls';
                    row[clsAction]('b-completed');
                    return {
                        class: 'badge',
                        style: {
                            color: `var(--${statusColors[statuses.indexOf(value) + 1]})`,
                        },
                        text: value,
                    };
                },
                editor: {
                    type: 'combo',
                    editable: false,
                    items: statuses,
                },
                filterable: {
                    filterField: {
                        type: 'combo',
                        editable: false,
                        items: statuses,
                    },
                },
            },
            {
                text: 'Start',
                ref: 'startFilter',
                field: 'startDate',
                type: 'date',
                format: 'MMM D',
                width: '6em',
            },
            {
                text: 'Total cost',
                ref: 'totalFilter',
                field: 'cost',
                type: 'number',
                align: 'end',
                width: '15em',
                htmlEncode: false,
                renderer({ value, record: { estimatedCost } }) {
                    const diff = estimatedCost && value ? Math.round(1000 * (value / estimatedCost - 1)) / 10 : 0;
                    if (value && value !== estimatedCost) {
                        const positive = value > estimatedCost;
                        const label = diff
                            ? `<div class="diffLabel ${positive ? 'up' : 'down'}">${positive ? '+' : ''}${diff}%<i class="change-indicator fa fa-arrow-trend-${positive ? 'up' : 'down'}"></i></div>`
                            : '';
                        return label + formatUSD(value);
                    }
                    return '';
                },
            },
            {
                text: 'Progress %',
                ref: 'progressFilter',
                field: 'progress',
                width: '12em',
                align: 'end',
                type: 'percent',
            },
            {
                text: 'Team members',
                field: 'members',
                flex: '1 1 10em',
                editor: {
                    type: 'combo',
                    multiSelect: true,
                    editable: false,
                    store: memberStore,
                    displayField: 'name',
                },
                renderer({ value }) {
                    return value?.length
                        ? {
                              class: 'avatar-container',
                              children: value.map(getAvatars),
                          }
                        : '';
                },
                filterable: {
                    filterField: {
                        type: 'combo',
                        editable: false,
                        store: memberStore.chain(),
                        valueField: 'id',
                        displayField: 'name',
                    },
                    filterFn: ({ record, value }) => record.members?.includes(value * 1),
                },
            },
        ],

        store: {
            readUrl: 'https://bryntum.com/demos/live/grid/project-summary/data/projects.json',
            autoLoad: true,
            transformLoadedData(data) {
                data.forEach((record) => {
                    record.startDate = DateHelper.add(DateHelper.startOf(new Date(), 'month'), record.start, 'month');
                });
                return data;
            },
            listeners: {
                async load() {
                    await memberStore.load();
                    grid.refreshRows?.();
                },
            },
        },
    });

    Tooltip.new({
        forElement: grid.element,
        forSelector: '.avatar',
        listeners: {
            beforeShow({ source }) {
                source.html = source.activeTarget.elementData.name;
            },
        },
    });
});

// Example: Master Detail with Tree Data (Server-Side Row Model)
// This example demonstrates combining master/detail with tree data in SSRM.

const gridOptions = {
    columnDefs: [
        { field: 'employeeName', cellRenderer: 'agGroupCellRenderer' },
        { field: 'jobTitle' },
        { field: 'employmentType' },
    ],
    rowModelType: 'serverSide',
    treeData: true,
    masterDetail: true,
    isServerSideGroup: (dataItem) => !!dataItem.children,
    getServerSideGroupKey: (dataItem) => dataItem.employeeId,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [{ field: 'project' }, { field: 'duration' }],
        },
        getDetailRowData: (params) => {
            // Example: provide detail data from the master row
            params.successCallback(params.data.projects || []);
        },
    },
    // ...other grid options as needed
};

// Example server-side data structure
const rowData = [
    {
        employeeId: 101,
        employeeName: 'Erica Rogers',
        jobTitle: 'CEO',
        employmentType: 'Permanent',
        projects: [{ project: 'Strategy', duration: '2 years' }],
        children: [
            {
                employeeId: 102,
                employeeName: 'Malcolm Barrett',
                jobTitle: 'Exec. Vice President',
                employmentType: 'Permanent',
                projects: [{ project: 'Operations', duration: '1 year' }],
                children: [
                    {
                        employeeId: 103,
                        employeeName: 'Leah Flowers',
                        jobTitle: 'Parts Technician',
                        employmentType: 'Contract',
                        projects: [{ project: 'Parts', duration: '6 months' }],
                    },
                ],
            },
        ],
    },
];

// The datasource should provide tree data and detail data as shown above.

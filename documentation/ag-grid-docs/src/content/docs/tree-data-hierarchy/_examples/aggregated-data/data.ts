const data = [
    { path: ['Desktop'], type: 'folder', size: 2097152, items: 1 },
    { path: ['Desktop', 'ProjectAlpha'], type: 'folder', size: 1572864 },
    {
        path: ['Desktop', 'ProjectAlpha', 'Proposal.docx'],
        size: 512000,
        created: '2023-07-10',
        modified: '2023-08-01',
        items: 1,
    },
    {
        path: ['Desktop', 'ProjectAlpha', 'Timeline.xlsx'],
        size: 1048576,
        created: '2023-07-12',
        modified: '2023-08-03',
        items: 1,
    },
    { path: ['Desktop', 'ToDoList.txt'], size: 51200, created: '2023-08-05', modified: '2023-08-10', items: 1 },
    {
        path: ['Desktop', 'MeetingNotes_August.pdf'],
        size: 460800,
        created: '2023-08-15',
        modified: '2023-08-15',
        items: 1,
    },
];

export function getData() {
    return data;
}

const files = [
    { path: ['Desktop', 'ProjectAlpha', 'Proposal.docx'], size: 512000, created: '2023-07-10', modified: '2023-08-01' },
    {
        path: ['Desktop', 'ProjectAlpha', 'Timeline.xlsx'],
        size: 1048576,
        created: '2023-07-12',
        modified: '2023-08-03',
    },
    { path: ['Desktop', 'ToDoList.txt'], size: 51200, created: '2023-08-05', modified: '2023-08-10' },
    { path: ['Desktop', 'MeetingNotes_August.pdf'], size: 460800, created: '2023-08-15', modified: '2023-08-15' },
];

export function getData() {
    return files;
}

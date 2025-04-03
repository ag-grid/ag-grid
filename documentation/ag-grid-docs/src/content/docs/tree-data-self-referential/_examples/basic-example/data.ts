const data = [
    {
        id: '1',
        name: 'Desktop',
        type: 'folder',
        size: 2097152,
        items: 1,
    },
    {
        id: '2',
        parentId: '1',
        name: 'ProjectAlpha',
        type: 'folder',
        size: 1572864,
    },
    {
        id: '3',
        parentId: '2',
        name: 'Proposal.docx',
        size: 512000,
        created: '2023-07-10',
        modified: '2023-08-01',
        items: 1,
    },
    {
        id: '4',
        parentId: '2',
        name: 'Timeline.xlsx',
        size: 1048576,
        created: '2023-07-12',
        modified: '2023-08-03',
        items: 1,
    },
    {
        id: '5',
        parentId: '1',
        name: 'ToDoList.txt',
        size: 51200,
        created: '2023-08-05',
        modified: '2023-08-10',
        items: 1,
    },
    {
        id: '6',
        parentId: '1',
        name: 'MeetingNotes_August.pdf',
        size: 460800,
        created: '2023-08-15',
        modified: '2023-08-15',
        items: 1,
    },
];

export function getData() {
    return data;
}

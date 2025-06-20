import type { IFile } from './fileUtils';

export function getData(): IFile[] {
    return [
        { id: '1', name: 'Documents', type: 'folder' },
        { id: '2', parentId: '1', name: 'txt', type: 'folder' },
        {
            id: '3',
            parentId: '2',
            name: 'notes.txt',
            type: 'file',
            dateModified: 'May 21 2017 01:50:00 PM',
            size: 14.7,
        },
        { id: '4', parentId: '1', name: 'pdf', type: 'folder' },
        { id: '5', parentId: '4', name: 'book.pdf', type: 'file', dateModified: 'May 20 2017 01:50:00 PM', size: 2.1 },
        { id: '6', parentId: '4', name: 'cv.pdf', type: 'file', dateModified: 'May 20 2016 11:50:00 PM', size: 2.4 },
        { id: '7', parentId: '1', name: 'xls', type: 'folder' },
        {
            id: '8',
            parentId: '7',
            name: 'accounts.xls',
            type: 'file',
            dateModified: 'Aug 12 2016 10:50:00 AM',
            size: 4.3,
        },
        { id: '9', parentId: '1', name: 'stuff', type: 'folder' },
        { id: '10', parentId: '9', name: 'xyz.txt', type: 'file', dateModified: 'Jan 17 2016 08:03:00 PM', size: 1.1 },
        { id: '11', name: 'Music', type: 'folder' },
        { id: '12', parentId: '11', name: 'mp3', type: 'folder' },
        {
            id: '13',
            parentId: '12',
            name: 'theme.mp3',
            type: 'file',
            dateModified: 'Sep 11 2016 08:03:00 PM',
            size: 14.3,
        },
        { id: '14', name: 'Misc', type: 'folder' },
        {
            id: '15',
            parentId: '14',
            name: 'temp.txt',
            type: 'file',
            dateModified: 'Aug 12 2016 10:50:00 PM',
            size: 101,
        },
    ];
}

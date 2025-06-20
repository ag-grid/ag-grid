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
            dateModified: '2017-05-21',
            size: 14.7,
        },
        { id: '4', parentId: '1', name: 'pdf', type: 'folder' },
        { id: '5', parentId: '4', name: 'book.pdf', type: 'file', dateModified: '2017-05-20', size: 2.1 },
        { id: '6', parentId: '4', name: 'cv.pdf', type: 'file', dateModified: '2016-05-20', size: 2.4 },
        { id: '7', parentId: '1', name: 'xls', type: 'folder' },
        {
            id: '8',
            parentId: '7',
            name: 'accounts.xls',
            type: 'file',
            dateModified: '2016-08-12',
            size: 4.3,
        },
        { id: '9', parentId: '1', name: 'stuff', type: 'folder' },
        { id: '10', parentId: '9', name: 'xyz.txt', type: 'file', dateModified: '2016-01-17', size: 1.1 },
        { id: '11', name: 'Music', type: 'folder' },
        { id: '12', parentId: '11', name: 'mp3', type: 'folder' },
        {
            id: '13',
            parentId: '12',
            name: 'theme.mp3',
            type: 'file',
            dateModified: '2016-09-11',
            size: 14.3,
        },
        { id: '14', name: 'Misc', type: 'folder' },
        {
            id: '15',
            parentId: '14',
            name: 'temp.txt',
            type: 'file',
            dateModified: '2016-08-12',
            size: 101,
        },
    ];
}

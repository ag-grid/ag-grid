export interface IFile {
    id: string;
    name: string;
    type: 'file' | 'folder';
    dateModified?: string;
    size?: number;
    children?: IFile[];
}

export const files: IFile[] = [
    {
        id: '1',
        name: 'Documents',
        type: 'folder',
        children: [
            {
                id: '2',
                name: 'txt',
                type: 'folder',
                children: [
                    {
                        id: '3',
                        name: 'notes.txt',
                        type: 'file',
                        dateModified: 'May 21 2017 01:50:00 PM',
                        size: 14.7,
                    },
                ],
            },
            {
                id: '4',
                name: 'pdf',
                type: 'folder',
                children: [
                    {
                        id: '5',
                        name: 'book.pdf',
                        type: 'file',
                        dateModified: 'May 20 2017 01:50:00 PM',
                        size: 2.1,
                    },
                    {
                        id: '6',
                        name: 'cv.pdf',
                        type: 'file',
                        dateModified: 'May 20 2016 11:50:00 PM',
                        size: 2.4,
                    },
                ],
            },
            {
                id: '7',
                name: 'xls',
                type: 'folder',
                children: [
                    {
                        id: '8',
                        name: 'accounts.xls',
                        type: 'file',
                        dateModified: 'Aug 12 2016 10:50:00 AM',
                        size: 4.3,
                    },
                ],
            },
            {
                id: '9',
                name: 'stuff',
                type: 'folder',
                children: [
                    {
                        id: '10',
                        name: 'xyz.txt',
                        type: 'file',
                        dateModified: 'Jan 17 2016 08:03:00 PM',
                        size: 1.1,
                    },
                ],
            },
        ],
    },
    {
        id: '11',
        name: 'Music',
        type: 'folder',
        children: [
            {
                id: '12',
                name: 'mp3',
                type: 'folder',
                children: [
                    {
                        id: '13',
                        name: 'theme.mp3',
                        type: 'file',
                        dateModified: 'Sep 11 2016 08:03:00 PM',
                        size: 14.3,
                    },
                ],
            },
        ],
    },
    {
        id: '14',
        name: 'Misc',
        type: 'folder',
        children: [
            {
                id: '15',
                name: 'temp.txt',
                type: 'file',
                dateModified: 'Aug 12 2016 10:50:00 PM',
                size: 101,
            },
        ],
    },
];

export interface IFile {
    id: string;
    name: string;
    type: 'folder' | 'file';
    dateModified?: string; // ISO date string
    size?: number; // Size in MB
    children?: IFile[];
}

export function getData(): IFile[] {
    return [
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
                            dateModified: '2017-05-21',
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
                            dateModified: '2017-05-20',
                            size: 2.1,
                        },
                        {
                            id: '6',
                            name: 'cv.pdf',
                            type: 'file',
                            dateModified: '2016-05-20',
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
                            dateModified: '2016-08-12',
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
                            dateModified: '2016-01-17',
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
                            dateModified: '2016-09-11',
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
                    dateModified: '2016-08-12',
                    size: 101,
                },
            ],
        },
    ];
}

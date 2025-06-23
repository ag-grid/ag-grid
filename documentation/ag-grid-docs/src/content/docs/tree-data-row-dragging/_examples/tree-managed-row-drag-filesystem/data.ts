export interface IFile {
    id: string;
    name: string;
    type: 'folder' | 'file' | 'readonly-folder';
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
                    name: 'notes.txt',
                    type: 'file',
                    dateModified: '2017-05-21',
                    size: 14.7,
                },
                {
                    id: '3',
                    name: 'accounts.xls',
                    type: 'file',
                    dateModified: '2016-08-12',
                    size: 4.3,
                },
                {
                    id: '4',
                    name: 'xyz.txt',
                    type: 'file',
                    dateModified: '2016-01-17',
                    size: 1.1,
                },
                {
                    id: '5',
                    name: 'var',
                    type: 'folder',
                },
            ],
        },
        {
            id: '100',
            name: 'READONLY',
            type: 'readonly-folder',
            children: [
                {
                    id: '101',
                    name: 'subfolder',
                    type: 'folder',
                    children: [
                        {
                            id: '102',
                            name: 'temp.txt',
                            type: 'file',
                            dateModified: '2016-08-12',
                            size: 101,
                        },
                    ],
                },
                {
                    id: '103',
                    name: 'notes.txt',
                    type: 'file',
                    dateModified: '2016-08-12',
                    size: 400,
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
    ];
}

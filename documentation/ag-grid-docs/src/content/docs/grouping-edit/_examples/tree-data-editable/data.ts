export interface FileRecord {
    name: string;
    size: number;
    children?: FileRecord[];
}

export function getData(): FileRecord[] {
    return [
        {
            name: 'Documents',
            size: 0,
            children: [
                {
                    name: 'Reports',
                    size: 0,
                    children: [
                        { name: 'Q1 Report.pdf', size: 120 },
                        { name: 'Q2 Report.pdf', size: 150 },
                        { name: 'Q3 Report.pdf', size: 90 },
                    ],
                },
                {
                    name: 'Invoices',
                    size: 0,
                    children: [
                        { name: 'Invoice 001.pdf', size: 45 },
                        { name: 'Invoice 002.pdf', size: 60 },
                    ],
                },
                { name: 'README.txt', size: 10 },
            ],
        },
        {
            name: 'Media',
            size: 0,
            children: [
                {
                    name: 'Photos',
                    size: 0,
                    children: [
                        { name: 'Vacation.jpg', size: 250 },
                        { name: 'Family.jpg', size: 180 },
                        { name: 'Sunset.jpg', size: 320 },
                    ],
                },
                {
                    name: 'Videos',
                    size: 0,
                    children: [
                        { name: 'Tutorial.mp4', size: 500 },
                        { name: 'Presentation.mp4', size: 350 },
                    ],
                },
            ],
        },
    ];
}

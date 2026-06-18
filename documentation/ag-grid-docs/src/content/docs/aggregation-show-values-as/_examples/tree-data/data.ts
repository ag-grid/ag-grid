export interface FileRow {
    path: string[];
    size?: number;
}

export function getData(): FileRow[] {
    return [
        { path: ['Documents', 'Work', 'Proposal.docx'], size: 512000 },
        { path: ['Documents', 'Work', 'Timeline.xlsx'], size: 1048576 },
        { path: ['Documents', 'Work', 'Report.pdf'], size: 1024000 },
        { path: ['Documents', 'Personal', 'Taxes2023.pdf'], size: 768000 },
        { path: ['Documents', 'Personal', 'Resume.docx'], size: 256000 },
        { path: ['Media', 'Photos', 'Holiday.jpg'], size: 4194304 },
        { path: ['Media', 'Photos', 'Family.jpg'], size: 3145728 },
        { path: ['Media', 'Video', 'Trip.mp4'], size: 52428800 },
        { path: ['Media', 'Video', 'Birthday.mp4'], size: 31457280 },
        { path: ['Downloads', 'Installer.dmg'], size: 8388608 },
        { path: ['Downloads', 'Dataset.csv'], size: 2097152 },
    ];
}

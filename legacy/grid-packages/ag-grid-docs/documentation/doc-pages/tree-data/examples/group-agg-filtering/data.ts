export function getData(): any[] {
    // specify the data
    var rowData = [
        {
            id: 1,
            filePath: ['Documents'],
            size: 20,
        },
        {
            id: 2,
            filePath: ['Documents', 'txt'],
        },
        {
            id: 3,
            filePath: ['Documents', 'txt', 'notes.txt'],
            dateModified: 'May 21 2017 01:50:00 PM',
            size: 14.7,
        },
        {
            id: 4,
            filePath: ['Documents', 'pdf'],
        },
        {
            id: 5,
            filePath: ['Documents', 'pdf', 'book.pdf'],
            dateModified: 'May 20 2017 01:50:00 PM',
            size: 2.1,
        },
        {
            id: 6,
            filePath: ['Documents', 'pdf', 'cv.pdf'],
            dateModified: 'May 20 2016 11:50:00 PM',
            size: 2.4,
        },
        {
            id: 7,
            filePath: ['Documents', 'xls'],
        },
        {
            id: 8,
            filePath: ['Documents', 'xls', 'accounts.xls'],
            dateModified: 'Aug 12 2016 10:50:00 AM',
            size: 4.3,
        },
        {
            id: 9,
            filePath: ['Documents', 'stuff'],
        },
        {
            id: 10,
            filePath: ['Documents', 'stuff', 'xyz.txt'],
            dateModified: 'Jan 17 2016 08:03:00 PM',
            size: 1.1,
        },
        {
            id: 11,
            filePath: ['Music', 'mp3', 'pop'],
            dateModified: 'Sep 11 2016 08:03:00 PM',
            size: 14.3,
        },
        {
            id: 12,
            filePath: ['temp.txt'],
            dateModified: 'Aug 12 2016 10:50:00 PM',
            size: 101,
        },
        {
            id: 13,
            filePath: ['Music', 'mp3', 'pop', 'theme.mp3'],
            dateModified: 'Aug 12 2016 10:50:00 PM',
            size: 101,
        },
        {
            id: 14,
            filePath: ['Music', 'mp3', 'jazz'],
            dateModified: 'Aug 12 2016 10:50:00 PM',
            size: 101,
        },
    ]
    return rowData;
}
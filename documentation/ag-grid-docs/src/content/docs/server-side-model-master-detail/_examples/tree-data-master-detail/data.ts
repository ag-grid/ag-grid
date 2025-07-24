export const fakeData = [
    {
        id: 1,
        name: 'Root 1',
        children: [
            {
                id: 2,
                name: 'Child 1.1',
                info: 'Leaf',
                details: [
                    { label: 'Detail A', value: 'Value A' },
                    { label: 'Detail B', value: 'Value B' },
                ],
            },
            {
                id: 3,
                name: 'Child 1.2',
                info: 'Leaf',
            },
        ],
    },
    {
        id: 4,
        name: 'Root 2',
        details: [
            { label: 'Detail C', value: 'Value C' },
            { label: 'Detail D', value: 'Value D' },
        ],
        children: [
            {
                id: 5,
                name: 'Child 2.1',
                info: 'Leaf',
                details: [{ label: 'Detail E', value: 'Value E' }],
            },
        ],
    },
    {
        id: 6,
        name: 'Root 3',
        details: [{ label: 'Detail F', value: 'Value F' }],
    },
];

export function getData() {
    return [
        {
            a1: 'level 1 - 1',
            b1: 'level 1 - 1',
            children: [
                {
                    a2: 'level 2 - 1',
                    b2: 'level 2 - 1',
                    children: [
                        { a3: 'level 3 - 1', b3: 'level 3 - 1' },
                        { a3: 'level 3 - 2', b3: 'level 3 - 2' },
                    ],
                },
            ],
        },
        {
            a1: 'level 1 - 2',
            b1: 'level 1 - 2',
            children: [
                {
                    a2: 'level 2 - 2',
                    b2: 'level 2 - 2',
                    children: [
                        { a3: 'level 3 - 3', b3: 'level 3 - 3' },
                        { a3: 'level 3 - 4', b3: 'level 3 - 4' },
                    ],
                },
            ],
        },
    ];
}

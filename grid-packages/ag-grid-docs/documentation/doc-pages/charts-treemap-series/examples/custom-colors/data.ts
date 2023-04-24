export function getData() {
    return {
        name: 'Products',
        children: [
            {
                name: 'Foodstuffs',
                children: [
                    {
                        name: 'Buckwheat Honey',
                        exports: 25000,
                    },
                    {
                        name: 'Doughnut Holes',
                        exports: 8000,
                    },
                    {
                        name: 'Fly Agarics',
                        exports: 5000,
                    },
                    {
                        name: 'Pumpkins',
                        exports: 12000,
                    },
                    {
                        name: 'Sunflowers',
                        exports: 10000,
                    },
                ],
            },
            {
                name: 'Instruments',
                children: [
                    {
                        name: 'Air Fresheners',
                        exports: 2000,
                    },
                    {
                        name: 'Clock Hands',
                        exports: 8000,
                    },
                    {
                        name: 'Digging Sticks',
                        exports: 5000,
                    },
                    {
                        name: 'Logarithmic Rulers',
                        exports: 2000,
                    },
                ],
            },
        ],
    };
}

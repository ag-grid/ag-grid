// Data for the Master / Detail example with tree data with children

export interface Fact {
    id: string;
    description: string;
    importance: number;
}

export interface VegetableNode {
    id: string;
    name: string;
    origin?: string;
    facts?: Fact[];
    children?: VegetableNode[];
}

export const vegetablesData: VegetableNode[] = [
    {
        id: '1',
        name: 'Root Vegetables',
        origin: 'Various',
        children: [
            {
                id: '2',
                name: 'Carrot',
                origin: 'Afghanistan',
                facts: [
                    { id: 'f3', description: 'Orange color', importance: 3 },
                    { id: 'f4', description: 'High in beta-carotene', importance: 5 },
                    { id: 'f5', description: 'Can be eaten raw or cooked', importance: 4 },
                    { id: 'f6', description: 'Popular in soups and salads', importance: 2 },
                ],
            },
            {
                id: '3',
                name: 'Potato',
                origin: 'Peru',
                facts: [
                    { id: 'f7', description: 'Starchy', importance: 4 },
                    { id: 'f8', description: 'Versatile in cooking', importance: 5 },
                    { id: 'f9', description: 'Main ingredient in fries', importance: 3 },
                    { id: 'f10', description: 'Rich in potassium', importance: 4 },
                ],
                children: [
                    {
                        id: '11',
                        name: 'Varieties',
                        origin: 'Various',
                        children: [
                            {
                                id: '12',
                                name: 'Russet',
                                origin: 'United States',
                                facts: [{ id: 'f11', description: 'Best for baking', importance: 5 }],
                            },
                            {
                                id: '13',
                                name: 'Yukon Gold',
                                origin: 'Canada',
                                facts: [{ id: 'f12', description: 'Great for mashing', importance: 5 }],
                            },
                        ],
                    },
                ],
            },
            {
                id: '4',
                name: 'Beetroot',
                origin: 'Mediterranean',
                facts: [
                    { id: 'f13', description: 'Deep red color', importance: 3 },
                    { id: 'f14', description: 'Used in salads', importance: 4 },
                    { id: 'f15', description: 'Can be pickled', importance: 2 },
                    { id: 'f16', description: 'Rich in antioxidants', importance: 5 },
                ],
            },
        ],
    },
    {
        id: '5',
        name: 'Leafy Greens',
        origin: 'Various',
        facts: [
            { id: 'f17', description: 'Edible leaves', importance: 5 },
            { id: 'f18', description: 'Rich in vitamins', importance: 4 },
        ],
        children: [
            {
                id: '6',
                name: 'Spinach',
                origin: 'Persia',
                facts: [
                    { id: 'f19', description: 'High in iron', importance: 5 },
                    { id: 'f20', description: 'Popular in salads', importance: 3 },
                    { id: 'f21', description: 'Used in smoothies', importance: 2 },
                    { id: 'f22', description: 'Rich in vitamin K', importance: 4 },
                ],
                children: [
                    {
                        id: '14',
                        name: 'Baby Spinach',
                        origin: 'Unknown',
                    },
                ],
            },
            {
                id: '7',
                name: 'Lettuce',
                origin: 'Egypt',
                facts: [
                    { id: 'f23', description: 'Common in sandwiches', importance: 3 },
                    { id: 'f24', description: 'Low calorie', importance: 4 },
                    { id: 'f25', description: 'Main ingredient in Caesar salad', importance: 5 },
                ],
                children: [
                    {
                        id: '15',
                        name: 'Types',
                        origin: 'Various',
                        children: [
                            {
                                id: '16',
                                name: 'Romaine',
                                origin: 'Mediterranean',
                                facts: [{ id: 'f26', description: 'Crunchy texture', importance: 4 }],
                            },
                            {
                                id: '17',
                                name: 'Iceberg',
                                origin: 'United States',
                                facts: [{ id: 'f27', description: 'Mild flavour', importance: 3 }],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: '8',
        name: 'Cruciferous',
        origin: 'Various',
        facts: [
            { id: 'f28', description: 'Contain glucosinolates', importance: 5 },
            { id: 'f29', description: 'Support immune health', importance: 4 },
        ],
        children: [
            {
                id: '9',
                name: 'Broccoli',
                origin: 'Italy',
                facts: [
                    { id: 'f30', description: 'Green florets', importance: 4 },
                    { id: 'f31', description: 'Rich in vitamin C', importance: 5 },
                    { id: 'f32', description: 'Can be steamed or roasted', importance: 3 },
                ],
                children: [
                    {
                        id: '18',
                        name: 'Broccolini',
                        origin: 'Japan',
                    },
                ],
            },
            {
                id: '10',
                name: 'Cauliflower',
                origin: 'Cyprus',
                facts: [
                    { id: 'f34', description: 'White florets', importance: 4 },
                    { id: 'f35', description: 'Used in low-carb recipes', importance: 5 },
                    { id: 'f36', description: 'Mild flavour', importance: 2 },
                ],
                children: [
                    {
                        id: '19',
                        name: 'Purple Cauliflower',
                        origin: 'Italy',
                    },
                ],
            },
        ],
    },
];

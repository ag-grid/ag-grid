export interface BudgetRecord {
    name: string;
    budget: number;
    children?: BudgetRecord[];
}

export function getData(): BudgetRecord[] {
    return [
        {
            name: 'Engineering',
            budget: 0,
            children: [
                {
                    name: 'Frontend',
                    budget: 0,
                    children: [
                        { name: 'Alice', budget: 85000 },
                        { name: 'Bob', budget: 92000 },
                        { name: 'Charlie', budget: 78000 },
                    ],
                },
                {
                    name: 'Backend',
                    budget: 0,
                    children: [
                        { name: 'Diana', budget: 95000 },
                        { name: 'Evan', budget: 88000 },
                    ],
                },
                { name: 'Dave (DevOps)', budget: 90000 },
            ],
        },
        {
            name: 'Marketing',
            budget: 0,
            children: [
                {
                    name: 'Digital',
                    budget: 0,
                    children: [
                        { name: 'Fiona', budget: 72000 },
                        { name: 'George', budget: 68000 },
                        { name: 'Hannah', budget: 75000 },
                    ],
                },
                {
                    name: 'Brand',
                    budget: 0,
                    children: [
                        { name: 'Ian', budget: 80000 },
                        { name: 'Jane', budget: 76000 },
                    ],
                },
            ],
        },
    ];
}

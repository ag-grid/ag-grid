export async function getData(delay: number = 100): Promise<any[]> {
    return new Promise((resolve) => setTimeout(() => resolve(generateData()), delay));
}

function generateData(): any[] {
    return [
        { period: 'Q1 2021', recurring: 485829, individual: 237438 },
        { period: 'Q2 2021', recurring: 512743, individual: 245672 },
        { period: 'Q3 2021', recurring: 521938, individual: 259371 },
        { period: 'Q4 2021', recurring: 152312, individual: 271839 },
        { period: 'Q1 2022', recurring: 558329, individual: 284738 },
        { period: 'Q2 2022', recurring: 572843, individual: 298472 },
        { period: 'Q3 2022', recurring: 589372, individual: 501233 },
        { period: 'Q4 2022', recurring: 601234, individual: 327195 },
        { period: 'Q1 2023', recurring: 615928, individual: 342839 },
        { period: 'Q2 2023', recurring: 628472, individual: 358293 },
        { period: 'Q3 2023', recurring: 642839, individual: 374829 },
        { period: 'Q4 2023', recurring: 657382, individual: 391829 },
    ];
}

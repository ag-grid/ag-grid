export interface Employee {
    id: number;
    name: string;
    department: string;
    startDate: Date;
    salary: number;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Katherine', 'Linus', 'Barbara', 'Dennis', 'Margaret', 'Tim', 'Radia'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Johnson', 'Torvalds', 'Liskov', 'Ritchie', 'Hamilton', 'Berners-Lee', 'Perlman'];
const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance'];

export function makeEmployees(count: number): Employee[] {
    const rows: Employee[] = [];
    for (let i = 0; i < count; i++) {
        rows.push({
            id: i + 1,
            name: `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]}`,
            department: DEPARTMENTS[i % DEPARTMENTS.length],
            startDate: new Date(2015 + (i % 10), i % 12, ((i * 7) % 27) + 1),
            salary: 35000 + ((i * 1337) % 90000),
        });
    }
    return rows;
}

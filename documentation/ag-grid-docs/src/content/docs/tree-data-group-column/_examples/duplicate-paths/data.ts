const files = [
    { employeeId: '1', name: 'Alice Johnson', path: ['1'] },
    { employeeId: '2', name: 'Bob Stevens', path: ['1', '2'] },
    { employeeId: '3', name: 'Bob Stevens', path: ['1', '3'] },
    { employeeId: '4', name: 'Jessica Adams', path: ['1', '4'] },
];

export function getData() {
    return files;
}

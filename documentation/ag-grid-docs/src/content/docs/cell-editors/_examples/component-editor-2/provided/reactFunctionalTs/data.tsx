export function getData(): any[] {
    const cloneObject = (obj: any) => JSON.parse(JSON.stringify(obj));

    const students = [
        {
            first_name: 'Bob',
            last_name: 'Harrison',
            age: 15,
            gender: 'Male',
            mood: 'Happy',
        },
        {
            first_name: 'Mary',
            last_name: 'Wilson',
            gender: 'Female',
            age: 11,
            mood: 'Sad',
        },
        {
            first_name: 'Zahid',
            last_name: 'Khan',
            gender: 'Male',
            age: 12,
            mood: 'Happy',
        },
        {
            first_name: 'Jerry',
            last_name: 'Mane',
            gender: 'Male',
            age: 12,
            mood: 'Happy',
        },
    ];

    // double the array twice, make more data!
    students.forEach((item) => {
        students.push(cloneObject(item));
    });
    students.forEach((item) => {
        students.push(cloneObject(item));
    });
    students.forEach((item) => {
        students.push(cloneObject(item));
    });

    return students;
}

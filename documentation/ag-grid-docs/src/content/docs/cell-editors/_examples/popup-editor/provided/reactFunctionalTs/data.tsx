export function getData(): any[] {
    const moods = [
        {
            mood: 'Happy',
        },
        {
            mood: 'Sad',
        },
        {
            mood: 'Happy',
        },
        {
            mood: 'Happy',
        },
    ];
    return [...moods, ...moods];
}

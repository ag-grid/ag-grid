export function getData(): any[] {
    const latinSentence =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit';

    function generateRandomSentence() {
        return latinSentence.slice(0, Math.floor(Math.random() * 100)) + '.';
    }

    const rowData = [];
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 50; j++) {
            rowData.push({
                name: 'Group ' + j,
                autoA: generateRandomSentence(),
                autoB: generateRandomSentence(),
            });
        }
    }
    return rowData;
}

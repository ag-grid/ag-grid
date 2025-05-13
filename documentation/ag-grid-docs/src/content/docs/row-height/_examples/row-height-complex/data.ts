const latinText = 'Lorem ipsum dolor sit amet.\nConsectetur adipiscing elit.';

export function getRowData() {
    const data = [];
    for (let i = 0; i < 10; ++i) {
        data.push({
            latinText,
        });
    }
    return data;
}

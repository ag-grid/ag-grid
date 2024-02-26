export function getData(): any[] {
    var data = []
    for (var i = 0; i < 20; i++) {
        data.push({
            a: 'Green ' + i * 2,
            b: 'Green ' + i * 3 + 11,
            c: 'Blue ' + i * 3 + 155,
            d: 'Red ' + i * 4 + 265,
            e: 'Yellow ' + i + 23
        })
    }
    return data
}
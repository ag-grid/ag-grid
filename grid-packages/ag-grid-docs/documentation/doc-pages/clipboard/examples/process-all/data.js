function getData() {
    var data = []
    for (var i = 0; i < 20; i++) {
        data.push({
            a: 'Green ' + i * 2,
            b: 'Green ' + i * 3 + 11,
            c: 'Green ' + i * 4 + 14,
            d: 'Green ' + i * 2 + 13,
            e: 'Blue ' + i * 3 + 155,
            f: 'Red ' + i * 4 + 265,
            g: 'Yellow ' + i + 23,
            h: 'Green ' + i * 3 + 23,
            i: 'Green ' + i * 7 + 23,
            j: 'Green ' + i * 9 + 23,
            k: 'Green ' + i * 13 + 23,
        })
    }
    return data
}
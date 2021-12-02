function getData() {
    var latinWords = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore'.split(
        ' '
    )

    function randomSentence() {
        var startIndex = Math.floor(Math.random() * (latinWords.length / 2))
        var str = latinWords.slice(startIndex, latinWords.length).join(' ')
        return str.charAt(0).toUpperCase() + str.slice(1, str.length)
    }

    var rowData = []
    for (var i = 0; i < 100; i++) {
        var row = {
            colA: randomSentence(),
            colB: randomSentence(),
            colC: randomSentence(),
        }

        rowData.push(row)
    }

    return rowData
}
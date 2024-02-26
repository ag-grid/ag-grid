
function getFileIcon(filename) {
    return filename.endsWith('.mp3') || filename.endsWith('.wav')
        ? 'far fa-file-audio'
        : filename.endsWith('.xls')
            ? 'far fa-file-excel'
            : filename.endsWith('.txt')
                ? 'far fa-file'
                : filename.endsWith('.pdf')
                    ? 'far fa-file-pdf'
                    : 'far fa-folder'
}


class FileCellRenderer {

    init(params) {
        var tempDiv = document.createElement('div')
        var value = params.value
        var icon = getFileIcon(params.value)
        tempDiv.innerHTML = icon
            ? '<i class="' +
            icon +
            '"/>' +
            '<span class="filename">' +
            value +
            '</span>'
            : value
        this.eGui = tempDiv.firstChild
    }
    getGui() {
        return this.eGui
    }

}

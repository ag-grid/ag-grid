function getFileCellRenderer() {
    function FileCellRenderer() { }

    FileCellRenderer.prototype.init = function (params) {
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
    FileCellRenderer.prototype.getGui = function () {
        return this.eGui
    }

    return FileCellRenderer
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length
        }
        return this.substring(this_len - search.length, this_len) === search
    }
}

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
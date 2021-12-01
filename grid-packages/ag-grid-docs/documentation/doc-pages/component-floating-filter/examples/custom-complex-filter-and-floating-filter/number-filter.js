function NumberFilter() { }

NumberFilter.prototype.init = function (params) {
    this.valueGetter = params.valueGetter
    this.filterText = null
    this.params = params
    this.setupGui()
}

// not called by AG Grid, just for us to help setup
NumberFilter.prototype.setupGui = function () {
    this.gui = document.createElement('div')
    this.gui.innerHTML =
        '<div style="padding: 4px;">' +
        '<div style="font-weight: bold;">Greater than: </div>' +
        '<div><input style="margin: 4px 0px 4px 0px;" type="number" id="filterText" placeholder="Number of medals..."/></div>' +
        '</div>'

    var that = this
    this.onFilterChanged = function () {
        that.extractFilterText()
        that.params.filterChangedCallback()
    }

    this.eFilterText = this.gui.querySelector('#filterText')
    this.eFilterText.addEventListener('input', this.onFilterChanged)
}

NumberFilter.prototype.extractFilterText = function () {
    this.filterText = this.eFilterText.value
}

NumberFilter.prototype.getGui = function () {
    return this.gui
}

NumberFilter.prototype.doesFilterPass = function (params) {
    var valueGetter = this.valueGetter
    var value = valueGetter(params)
    var filterValue = this.filterText

    if (this.isFilterActive()) {
        if (!value) return false
        return Number(value) > Number(filterValue)
    }
}

NumberFilter.prototype.isFilterActive = function () {
    return (
        this.filterText !== null &&
        this.filterText !== undefined &&
        this.filterText !== '' &&
        isNumeric(this.filterText)
    )
}

NumberFilter.prototype.getModel = function () {
    return this.isFilterActive() ? Number(this.eFilterText.value) : null
}

NumberFilter.prototype.setModel = function (model) {
    this.eFilterText.value = model
    this.extractFilterText()
}

NumberFilter.prototype.myMethodForTakingValueFromFloatingFilter = function (
    value
) {
    this.eFilterText.value = value
    this.onFilterChanged()
}

NumberFilter.prototype.destroy = function () {
    this.eFilterText.removeEventListener('input', this.onFilterChanged)
}
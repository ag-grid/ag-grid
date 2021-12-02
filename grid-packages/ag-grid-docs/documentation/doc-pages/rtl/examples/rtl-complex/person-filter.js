function getPersonFilter() {
    function PersonFilter() { }

    PersonFilter.prototype.init = function (params) {
        this.valueGetter = params.valueGetter
        this.filterText = null
        this.setupGui(params)
    }

    // not called by AG Grid, just for us to help setup
    PersonFilter.prototype.setupGui = function (params) {
        this.gui = document.createElement('div')
        this.gui.innerHTML =
            '<div style="padding: 4px;">' +
            '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
            '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/></div>' +
            '<div style="margin-top: 20px; width: 200px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>' +
            '<div style="margin-top: 20px; width: 200px;">Just to iterate anything can go in here, here is an image:</div>' +
            '<div><img src="images/ag-Grid2-200.png" style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/></div>' +
            '</div>'

        this.eFilterText = this.gui.querySelector('#filterText')
        this.eFilterText.addEventListener('changed', listener)
        this.eFilterText.addEventListener('paste', listener)
        this.eFilterText.addEventListener('input', listener)

        var that = this

        function listener(event) {
            that.filterText = event.target.value
            params.filterChangedCallback()
        }
    }

    PersonFilter.prototype.getGui = function () {
        return this.gui
    }

    PersonFilter.prototype.doesFilterPass = function (params) {
        // make sure each word passes separately, ie search for firstname, lastname
        var passed = true
        var valueGetter = this.valueGetter
        this.filterText
            .toLowerCase()
            .split(' ')
            .forEach(function (filterWord) {
                var value = valueGetter(params)
                if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
                    passed = false
                }
            })

        return passed
    }

    PersonFilter.prototype.isFilterActive = function () {
        var isActive =
            this.filterText !== null &&
            this.filterText !== undefined &&
            this.filterText !== ''
        return isActive
    }

    PersonFilter.prototype.getApi = function () {
        var that = this
        return {
            getModel: function () {
                return { value: that.filterText.value }
            },
            setModel: function (model) {
                that.eFilterText.value = model.value
            },
        }
    }

    // lazy, the example doesn't use getModel() and setModel()
    PersonFilter.prototype.getModel = function () { }

    PersonFilter.prototype.setModel = function () { }

    return PersonFilter;
}
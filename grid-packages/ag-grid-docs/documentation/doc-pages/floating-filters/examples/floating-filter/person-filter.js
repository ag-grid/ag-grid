function getPersonFilter() {
    function PersonFilter() { }

    PersonFilter.prototype.init = function (params) {
        this.params = params
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
        const { api, colDef, column, columnApi, context } = this.params;
        const { node } = params;

        const value = this.params.valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: node.data,
            getValue: (field) => node.data[field],
            node,
        }).toString().toLowerCase();

        // make sure each word passes separately, ie search for firstname, lastname
        return this.filterText
            .toLowerCase()
            .split(' ')
            .every(function (filterWord) {
                return value.indexOf(filterWord) >= 0;
            })
    }

    PersonFilter.prototype.isFilterActive = function () {
        return this.filterText != null && this.filterText !== ''
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

    PersonFilter.prototype.getModelAsString = function (model) {
        return model || ''
    }

    PersonFilter.prototype.getModel = function () {
        return this.filterText
    }
    // lazy, the example doesn't use setModel()
    PersonFilter.prototype.setModel = function () { }

    return PersonFilter
}
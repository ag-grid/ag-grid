agGrid.initialiseAgGridWithAngular1(angular);

var module = angular.module("example", ["agGrid", "ui.bootstrap"]);

module.controller("exampleCtrl", function ($scope, $compile) {

    var columnDefs = [
        {headerName: "Make", field: "make", headerComponent: 'makeHeaderComp'},
        {headerName: "Model", field: "model", filter: "modelFilterComp"},
        {headerName: "Price", field: "price", cellRenderer: "priceCellRenderer"},
        {
            headerName: "Date",
            field: "date",
            editable: true,
            cellEditor: 'dateEditor',
            filter:'agDateColumnFilter',
            filterParams:{
                comparator:function (filterLocalDateAtMidnight, dateAsString){
                    filterLocalDateAtMidnight.setHours(0);
                    filterLocalDateAtMidnight.setMinutes(0);
                    filterLocalDateAtMidnight.setSeconds(0);
                    filterLocalDateAtMidnight.setMilliseconds(0);

                    var dateParts  = dateAsString.split("/");
                    var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                }
            }
        }
    ];

    var rowData = [
        {make: "Toyota", model: "Celica", price: 35000, date: '1/1/2017'},
        {make: "Ford", model: "Mondeo", price: 32000, date: '10/4/2018'},
        {make: "Porsche", model: "Boxter", price: 72000}
    ];

    $scope.gridOptions = {
        enableFilter: true,
        columnDefs: columnDefs,
        rowData: rowData,
        components: {
            makeHeaderComp: MakeHeaderComp,
            modelFilterComp: ModelFilterComp,
            priceCellRenderer: PriceCellRenderer,
            dateEditor: DateEditor,
            agDateInput: DateInputComponent
        },
        onGridReady: function(params) {
            params.api.sizeColumnsToFit();
        }
    };

    function MakeHeaderComp() {
    }

    MakeHeaderComp.prototype.init = function (params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '=> {{params.displayName}}';

        // create and compile AngularJS scope for this component
        this.$scope = $scope.$new();
        $compile(this.eGui)(this.$scope);
        this.$scope.params = params;
        // in case we are running outside of angular (ie in an ag-grid started VM turn)
        // we call $apply. we put in timeout in case we are inside apply already.
        setTimeout(this.$scope.$apply.bind(this.$scope), 0);
    };

    MakeHeaderComp.prototype.getGui = function () {
        return this.eGui;
    };

    MakeHeaderComp.prototype.destroy = function () {
        this.$scope.$destroy();
    };


    function PriceCellRenderer() {
    }

    PriceCellRenderer.prototype.init = function (params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '=> ${{params.value}}';

        // create and compile AngularJS scope for this component
        this.$scope = $scope.$new();
        $compile(this.eGui)(this.$scope);
        this.$scope.params = params;
        // in case we are running outside of angular (ie in an ag-grid started VM turn)
        // we call $apply. we put in timeout in case we are inside apply already.
        setTimeout(this.$scope.$apply.bind(this.$scope), 0);
    };

    PriceCellRenderer.prototype.getGui = function () {
        return this.eGui;
    };

    PriceCellRenderer.prototype.destroy = function () {
        this.$scope.$destroy();
    };


    function ModelFilterComp() {
    }

    ModelFilterComp.prototype.init = function (initParams) {
        this.eGui = document.createElement('div');

        this.eGui.innerHTML =
            '<div style="width: 150px; padding: 20px;">' +
            '<label>' +
            '<input type="radio" ng-model="model.selection" value="All" ng-change="model.onSelectionChanged()"/> ' +
            'All' +
            '</label>' +
            '<br/>' +
            '<label>' +
            '<input type="radio" ng-model="model.selection" value="Celica" ng-change="model.onSelectionChanged()"/> ' +
            'Celica' +
            '</label>' +
            '<br/>' +
            '<label>' +
            '<input type="radio" ng-model="model.selection" value="Mondeo" ng-change="model.onSelectionChanged()"/> ' +
            'Mondeo' +
            '</label>' +
            '<br/>' +
            '<label>' +
            '<input type="radio" ng-model="model.selection" value="Boxter" ng-change="model.onSelectionChanged()"/> ' +
            'Boxter' +
            '</label>' +
            '<br/>' +
            'Selection = {{model.selection}}' +
            '</div>';

        this.selection = 'All';

        this.initParams = initParams;

        // create and compile AngularJS scope for this component
        this.$scope = $scope.$new();
        $compile(this.eGui)(this.$scope);
        this.$scope.model = this;
        // in case we are running outside of angular (ie in an ag-grid started VM turn)
        // we call $apply. we put in timeout in case we are inside apply already.
        setTimeout(this.$scope.$apply.bind(this.$scope), 0);
    };

    ModelFilterComp.prototype.onSelectionChanged = function () {
        this.initParams.filterChangedCallback();
    };

    ModelFilterComp.prototype.getGui = function () {
        return this.eGui;
    };

    ModelFilterComp.prototype.destroy = function () {
        this.$scope.$destroy();
    };

    ModelFilterComp.prototype.isFilterActive = function () {
        return this.selection !== 'All';
    };

    ModelFilterComp.prototype.doesFilterPass = function (filterPassParams) {
        var value = this.initParams.valueGetter(filterPassParams.node);
        return value === this.selection;
    };

    function DateEditor() {
    }

    DateEditor.prototype.init = function (params) {
        this.eGui = document.createElement('div');
        this.eGui.style.display = "inline-block";
        this.eGui.style.width = "190px";
        this.eGui.style.border = "none";
        this.eGui.innerHTML = '<input style="width: 150px; float: left" type="text" class="form-control" uib-datepicker-popup="{{format}}" ng-model="dt" is-open="popup.opened" datepicker-options="dateOptions" ng-required="true" close-text="Close"/>' +
            '<button style="float: left" type="button" class="btn btn-default" ng-click="open()"><i class="glyphicon glyphicon-calendar"></i></button>';

        // create and compile AngularJS scope for this component
        this.$scope = $scope.$new();
        $compile(this.eGui)(this.$scope);
        this.$scope.params = params;

        var that = this;
        this.$scope.today = function () {
            that.$scope.dt = new Date();
        };

        if (params.value) {
            this.$scope.dt = new Date(params.value)
        } else {
            this.$scope.today();
        }

        this.$scope.clear = function () {
            that.$scope.dt = null;
        };

        this.$scope.inlineOptions = {
            minDate: new Date(),
            showWeeks: true
        };

        this.$scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(1990, 1, 1),
            startingDay: 1
        };

        this.$scope.open = function () {
            that.$scope.popup.opened = true;
        };

        this.$scope.setDate = function (year, month, day) {
            that.$scope.dt = new Date(year, month, day);
        };

        this.$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        this.$scope.format = this.$scope.formats[0];
        this.$scope.altInputFormats = ['M!/d!/yyyy'];

        this.$scope.popup = {
            opened: false
        };

        this.$scope.$watch('popup.opened', function (newVal, oldVal) {
            if (!newVal && oldVal) {
                setTimeout(() => that.$scope.params.stopEditing(), 0)
            }
        });

        // in case we are running outside of angular (ie in an ag-grid started VM turn)
        // we call $apply. we put in timeout in case we are inside apply already.
        setTimeout(this.$scope.$apply.bind(this.$scope), 0);
    };

    DateEditor.prototype.getGui = function () {
        return this.eGui;
    };

    DateEditor.prototype.destroy = function () {
        this.$scope.$destroy();
    };

    DateEditor.prototype.isPopup = function () {
        return true;
    };

    DateEditor.prototype.getValue = function () {
        if (!this.$scope.dt) {
            return null;
        }
        return (this.$scope.dt.getMonth() + 1) + '/' +
            this.$scope.dt.getDate() + '/' +
            this.$scope.dt.getFullYear()
    };

    function DateInputComponent() {
    }

    DateInputComponent.prototype.init = function (params) {
        this.eGui = document.createElement('div');
        this.eGui.style.width = "310px";
        this.eGui.innerHTML = '<div style="display:inline-block; min-height:270px;">' +
            '      <div uib-datepicker ng-model="dt" class="well well-sm" datepicker-options="dateOptions"></div>' +
            '    </div>';

        // create and compile AngularJS scope for this component
        this.$scope = $scope.$new();
        $compile(this.eGui)(this.$scope);
        this.$scope.params = params;

        $scope.dt = new Date();

        this.$scope.dateOptions = {
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(1990, 1, 1)
        };

        var that = this;
        this.$scope.$watch('dt', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                setTimeout(() => that.$scope.params.onDateChanged(), 0)
            }
        });

        // in case we are running outside of angular (ie in an ag-grid started VM turn)
        // we call $apply. we put in timeout in case we are inside apply already.
        setTimeout(this.$scope.$apply.bind(this.$scope), 0);
    };

    DateInputComponent.prototype.getGui = function () {
        return this.eGui;
    };

    DateInputComponent.prototype.destroy = function () {
        this.$scope.$destroy();
    };

    DateInputComponent.prototype.getDate = function () {
        return this.$scope.dt;
    };

    DateInputComponent.prototype.setDate = function (date) {
        this.$scope.dt = date;
    };


});


agGrid.initialiseAgGridWithAngular1(angular);

var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $compile) {

    var columnDefs = [
        {headerName: "Make", field: "make", headerComponent: 'makeHeaderComp'},
        {headerName: "Model", field: "model", filter: "modelFilterComp"},
        {headerName: "Price", field: "price", cellRenderer: "priceCellRenderer"}
    ];

    var rowData = [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ];

    $scope.gridOptions = {
        enableFilter: true,
        columnDefs: columnDefs,
        rowData: rowData,
        components: {
            makeHeaderComp: MakeHeaderComp,
            modelFilterComp: ModelFilterComp,
            priceCellRenderer: PriceCellRenderer
        }
    };



    function MakeHeaderComp() {}

    MakeHeaderComp.prototype.init = function(params) {
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

    MakeHeaderComp.prototype.getGui = function() {
        return this.eGui;
    };

    MakeHeaderComp.prototype.destroy = function() {
        this.$scope.$destroy();
    };


    function PriceCellRenderer() {}

    PriceCellRenderer.prototype.init = function(params) {
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

    PriceCellRenderer.prototype.getGui = function() {
        return this.eGui;
    };

    PriceCellRenderer.prototype.destroy = function() {
        this.$scope.$destroy();
    };


    function ModelFilterComp() {}

    ModelFilterComp.prototype.init = function(initParams) {
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

    ModelFilterComp.prototype.onSelectionChanged = function() {
        this.initParams.filterChangedCallback();
    };

    ModelFilterComp.prototype.getGui = function() {
        return this.eGui;
    };

    ModelFilterComp.prototype.destroy = function() {
        this.$scope.$destroy();
    };

    ModelFilterComp.prototype.isFilterActive = function() {
        return this.selection !== 'All';
    };

    ModelFilterComp.prototype.doesFilterPass = function(filterPassParams) {
        var value = this.initParams.valueGetter(filterPassParams.node);
        return value===this.selection;
    };




});

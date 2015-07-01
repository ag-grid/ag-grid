
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $timeout) {

    var columnDefs = [
        {headerName: "Default String", field: "defaultString", width: 150, editable: true},
        {headerName: "Upper Case Only", field: "upperCaseOnly", width: 150, editable: true, newValueHandler: upperCaseNewValueHandler},
        {headerName: "Number", valueGetter: 'data.number', width: 150, editable: true, newValueHandler: numberNewValueHandler},
        {headerName: "Custom With Angular", field: "setAngular", width: 175, cellRenderer: customEditorUsingAngular},
        {headerName: "Custom No Angular", field: "setNoAngular", width: 175, cellRenderer: customEditorNoAngular}
    ];

    var data = [
        {defaultString: 'Apple', upperCaseOnly: 'APPLE', number: 11, setAngular: 'AAA', setNoAngular: 'AAA'},
        {defaultString: 'Orange', upperCaseOnly: 'ORANGE', number: 22, setAngular: 'BBB', setNoAngular: 'BBB'},
        {defaultString: 'Banana', upperCaseOnly: 'BANANA', number: 33, setAngular: 'CCC', setNoAngular: 'CCC'},
        {defaultString: 'Pear', upperCaseOnly: 'PEAR', number: 44, setAngular: 'DDD', setNoAngular: 'DDD'}
    ];

    var setSelectionOptions = ['AAA','BBB','CCC','DDD','EEE','FFF','GGG'];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: data,
        angularCompileRows: true
    };

    function upperCaseNewValueHandler(params) {
        params.data[params.colDef.field] = params.newValue.toUpperCase();
    }

    function numberNewValueHandler(params) {
        var valueAsNumber = parseInt(params.newValue);
        if (isNaN(valueAsNumber)) {
            window.alert("Invalid value " + params.newValue + ", must be a number");
        } else {
            params.data.number = valueAsNumber;
        }
    }

    function customEditorUsingAngular(params) {
        params.$scope.setSelectionOptions = setSelectionOptions;

        var html = '<span ng-show="!editing" ng-click="startEditing()">{{data.'+params.colDef.field+'}}</span> ' +
            '<select ng-blur="editing=false" ng-change="editing=false" ng-show="editing" ng-options="item for item in setSelectionOptions" ng-model="data.'+params.colDef.field+'">';

        // we could return the html as a string, however we want to add a 'onfocus' listener, which is no possible in AngularJS
        var domElement = document.createElement("span");
        domElement.innerHTML = html;

        params.$scope.startEditing = function() {
            params.$scope.editing = true; // set to true, to show dropdown

            // put this into $timeout, so it happens AFTER the digest cycle,
            // otherwise the item we are trying to focus is not visible
            $timeout(function () {
                var select = domElement.querySelector('select');
                select.focus();
            }, 0);
        };

        return domElement;
    }

    function customEditorNoAngular(params) {

        var editing = false;

        var eCell = document.createElement('span');
        var eLabel = document.createTextNode(params.value);
        eCell.appendChild(eLabel);

        var eSelect = document.createElement("select");

        setSelectionOptions.forEach(function(item) {
            var eOption = document.createElement("option");
            eOption.setAttribute("value", item);
            eOption.innerHTML = item;
            eSelect.appendChild(eOption);
        });
        eSelect.value = params.value;

        eCell.addEventListener('click', function () {
            if (!editing) {
                eCell.removeChild(eLabel);
                eCell.appendChild(eSelect);
                eSelect.focus();
                editing = true;
            }
        });

        eSelect.addEventListener('blur', function () {
            if (editing) {
                editing = false;
                eCell.removeChild(eSelect);
                eCell.appendChild(eLabel);
            }
        });

        eSelect.addEventListener('change', function () {
            if (editing) {
                editing = false;
                var newValue = eSelect.value;
                params.data[params.colDef.field] = newValue;
                eLabel.nodeValue = newValue;
                eCell.removeChild(eSelect);
                eCell.appendChild(eLabel);
            }
        });

        return eCell;
    }

});

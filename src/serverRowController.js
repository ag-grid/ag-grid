define([], function() {

    function ServerRowController() {
    }

    ServerRowController.prototype.setDatasource = function (datasource) {
        this.datasource = datasource;
    };

    ServerRowController.prototype.getModel = function () {
        return {
            getVirtualRow: function() {
                //return this.rowsAfterMap[index];
            },
            getVirtualRowCount: function() {
                //if (this.rowsAfterMap) {
                //    return this.rowsAfterMap.length;
                //} else {
                //    return 0;
                //}
            }
        };

    };

    return ServerRowController;

});
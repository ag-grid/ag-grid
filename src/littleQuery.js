
define([], function() {

    function LittleQuery() {

    }

    LittleQuery.prototype.removeFromArray = function() {
        console.log("little query remove from array");
    };

    return new LittleQuery();

});
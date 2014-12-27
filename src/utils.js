/** Singleton util class, with jquery and underscore like features. */
define([], function() {

    function Utils() {
    }

    Utils.prototype.uniqueValues = function(list, key) {
        var uniqueCheck = {};
        var result = [];
        for(var i = 0, l = list.length; i < l; i++){
            var value = list[i][key];
            if(!uniqueCheck.hasOwnProperty(value)) {
                result.push(value);
                uniqueCheck[value] = 1;
            }
        }
        result.sort();
        return result;
    };

    Utils.prototype.removeAllChildren = function(node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    };

    //if passed '42px' then returns the number 42
    Utils.prototype.pixelStringToNumber = function(val) {
        if (typeof val === "string") {
            if (val.indexOf("px")>=0) {
                val.replace("px","");
            }
            return parseInt(val);
        } else {
            return val;
        }
    };

    Utils.prototype.addCssClass = function(element, className) {
        var oldClasses = element.className;
        if (oldClasses.indexOf(className)>=0) {
            return;
        }
        element.className = oldClasses + " " + className;;
    };

    Utils.prototype.removeCssClass = function(element, className) {
        var oldClasses = element.className;
        if (oldClasses.indexOf(className)<0) {
            return;
        }
        var newClasses = oldClasses.replace(" " + className, "");
        newClasses = newClasses.replace(className + " ", "");
        if (newClasses==className) {
            newClasses = "";
        }
        element.className = newClasses;
    };

    Utils.prototype.removeFromArray = function(array, object) {
        array.splice(array.indexOf(object), 1);
    };

    return new Utils();

});
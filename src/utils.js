/** Singleton util class, with jquery and underscore like features. */
define([], function() {

    'use strict';

    function Utils() {
    }

    //adds all type of change listeners to an element, intended to be a text field
    Utils.prototype.addChangeListener = function(element, listener) {
        element.addEventListener("changed", listener);
        element.addEventListener("paste", listener);
        element.addEventListener("input", listener);
    };

    //if value is undefined, null or blank, returns null, othrewise returns the value
    Utils.prototype.makeNull = function(value) {
        if (value===null || value===undefined || value==="") {
            return null;
        } else {
            return value;
        }
    };

    Utils.prototype.uniqueValues = function(list, key) {
        var uniqueCheck = {};
        var result = [];
        for(var i = 0, l = list.length; i < l; i++){
            var value = list[i][key];
            if (value==="" || value===undefined) {
                value = null;
            }
            if(!uniqueCheck.hasOwnProperty(value)) {
                result.push(value);
                uniqueCheck[value] = 1;
            }
        }
        return result;
    };

    Utils.prototype.removeAllChildren = function(node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    };

    //adds an element to a div, but also adds a background checking for clicks,
    //so that when the background is clicked, the child is removed again, giving
    //a model look to popups.
    Utils.prototype.addAsModalPopup = function(eParent, eChild) {
        var eBackdrop = document.createElement("div");
        eBackdrop.className = "ag-popup-backdrop";

        eBackdrop.onclick = function() {
            eParent.removeChild(eChild);
            eParent.removeChild(eBackdrop);
        };

        eParent.appendChild(eBackdrop);
        eParent.appendChild(eChild);
    };

    //loads the template and returns it as an element. makes up for no simple way in
    //the dom api to load html directly, eg we cannot do this: document.createElement(template)
    Utils.prototype.loadTemplate = function(template) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = template;
        return tempDiv.firstChild;
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

    Utils.prototype.defaultComparator = function(valueA, valueB) {
        var valueAMissing = valueA===null || valueA===undefined;
        var valueBMissing = valueB===null || valueB===undefined;
        if (valueAMissing && valueBMissing) {return 0;}
        if (valueAMissing) {return -1;}
        if (valueBMissing) {return 1;}

        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }
    };

    return new Utils();

});
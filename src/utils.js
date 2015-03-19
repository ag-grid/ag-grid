/** Singleton util class, with jquery and underscore like features. */
define([], function() {

    'use strict';

    function Utils() {
    }

    //Returns true if it is a DOM node
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    Utils.prototype.isNode = function(o) {
        return (
            typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
        );
    };

    //Returns true if it is a DOM element
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    Utils.prototype.isElement = function(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    };

    //adds all type of change listeners to an element, intended to be a text field
    Utils.prototype.addChangeListener = function(element, listener) {
        element.addEventListener("changed", listener);
        element.addEventListener("paste", listener);
        element.addEventListener("input", listener);
    };

    //if value is undefined, null or blank, returns null, otherwise returns the value
    Utils.prototype.makeNull = function(value) {
        if (value===null || value===undefined || value==="") {
            return null;
        } else {
            return value;
        }
    };

    Utils.prototype.uniqueValuesFromRowWrappers = function(list, key) {
        var uniqueCheck = {};
        var result = [];
        for(var i = 0, l = list.length; i < l; i++){
            var rowData = list[i].rowData;
            var value = rowData ? rowData[key] : null;
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
        if (node) {
            while (node.hasChildNodes()) {
                node.removeChild(node.lastChild);
            }
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

    Utils.prototype.querySelectorAll_addCssClass = function(eParent, selector, cssClass) {
        var eRows = eParent.querySelectorAll(selector);
        for (var k = 0; k < eRows.length; k++) {
            this.addCssClass(eRows[k], cssClass);
        }
    };

    Utils.prototype.querySelectorAll_removeCssClass = function(eParent, selector, cssClass) {
        var eRows = eParent.querySelectorAll(selector);
        for (var k = 0; k < eRows.length; k++) {
            this.removeCssClass(eRows[k], cssClass);
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

    Utils.prototype.formatWidth = function(width) {
        if (typeof width === "number") {
            return width + "px";
        } else {
            return width;
        }
    };

    return new Utils();

});


//13:44CAMPO, Alberto, M&IBthe day you get to the fronty page
//from then on, on your post, a recurennt 5 visits
//you need to accumulate posts
//just make a post entry
//and put it in dzone
//disclose yourself as the author of the plattform and encourage disccussion
//this is the worst site, but the easiest to score
//second best
//news.ycombinator.com
//if you get published here... 1000-1500 visits on the day, and if you are lucky quite a lot recurrent
//and the gold pot
//reddit.com/programming if you get in the top spot there... well, that's massive
//this is the most difficult and you are likely to get some abuse, but is worth it

//from my experience, best hing is aggregator sites
//facebook, g+ and are also very good
//if they link you, it will improve your google positioning
//also having analytics makes google realise immeditaley that you are being visited
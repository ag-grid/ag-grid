define([

], function() {

    function Group(col, key) {
        this.col = col;
        this.key = key;
        this.expanded = false;
        this.children = [];
    }

    Group.prototype.setExpanded = function(expanded) {
        this.expanded = expanded;
    };

    Group.prototype.isExpanded = function() {
        return this.expanded;
    };

    Group.prototype.addChild = function(child) {
        this.children.push(child);
    };

    return Group;
});
var constants = require('./constants');

function ColumnController() {
    this.createModel();
}

ColumnController.prototype.init = function(angularGrid, selectionRendererFactory, gridOptionsWrapper) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.angularGrid = angularGrid;
    this.selectionRendererFactory = selectionRendererFactory;
};

ColumnController.prototype.createModel = function() {
    var that = this;
    this.model = {
        // used by:
        // + inMemoryRowController -> sorting, building quick filter text
        // + headerRenderer -> sorting (clearing icon)
        getAllColumns: function() {
            return that.columns;
        },
        // + rowController -> while inserting rows, and when tabbing through cells (need to change this)
        // need a newMethod - get next col index
        getVisibleColumns: function() {
            return that.visibleColumns;
        },
        // used by:
        // + angularGrid -> for setting body width
        // + rowController -> setting main row widths (when inserting and resizing)
        getBodyContainerWidth: function() {
            return that.getTotalColWidth(false);
        },
        // used by:
        // + angularGrid -> setting pinned body width
        getPinnedContainerWidth: function() {
            return that.getTotalColWidth(true);
        },
        // used by:
        // + headerRenderer -> setting pinned body width
        getColumnGroups: function() {
            return that.columnGroups;
        },
        // used by:
        // + api.getFilterModel() -> to map colDef to column, key can be colDef or field
        getColumn: function(key) {
            for (var i = 0; i<that.columns.length; i++) {
                var colDefMatches = that.columns[i].colDef === key;
                var fieldMatches = that.columns[i].colDef.field === key;
                if (colDefMatches || fieldMatches) {
                    return that.columns[i];
        }
            }
        },
        // used by:
        // + rowRenderer -> for navigation
        getVisibleColBefore: function(col) {
            var oldIndex = that.visibleColumns.indexOf(col);
            if (oldIndex > 0) {
                return that.visibleColumns[oldIndex - 1];
            } else {
                return null;
            }
        },
        // used by:
        // + rowRenderer -> for navigation
        getVisibleColAfter: function(col) {
            var oldIndex = that.visibleColumns.indexOf(col);
            if (oldIndex < (that.visibleColumns.length - 1)) {
                return that.visibleColumns[oldIndex + 1];
            } else {
                return null;
            }
        }
    };
};

ColumnController.prototype.getModel = function() {
    return this.model;
};

// called by angularGrid
ColumnController.prototype.setColumns = function(columnDefs) {
    this.buildColumns(columnDefs);
    this.ensureEachColHasSize();
    this.buildGroups();
    this.updateGroups();
    this.updateVisibleColumns();
};

// called by headerRenderer - when a header is opened or closed
ColumnController.prototype.columnGroupOpened = function(group) {
    group.expanded = !group.expanded;
    this.updateGroups();
    this.updateVisibleColumns();
    this.angularGrid.refreshHeaderAndBody();
};

// private
ColumnController.prototype.updateVisibleColumns = function() {
    // if not grouping by headers, then all columns are visible
    this.visibleColumns = [];
    if (!this.gridOptionsWrapper.isGroupHeaders()) {
        this.visibleColumns = this.columns;
        return;
    }
	
	this.updateVisibleColumnsByGroups(this.columnGroups);    
};
// private
// add allVisibleColumns
ColumnController.prototype.updateVisibleColumnsByGroups = function(groupList) {
    // if grouping, then only show col as per group rules
    for (var i = 0; i < groupList.length; i++) {
        var group = groupList[i];
        group.addToVisibleColumns(this.visibleColumns);
	this.updateVisibleColumnsByGroups(group.subGroups);
    }
};

// public - called from api
ColumnController.prototype.sizeColumnsToFit = function(availableWidth) {
    // avoid divide by zero
    if (availableWidth <= 0 || this.visibleColumns.length === 0) {
        return;
    }

    var currentTotalWidth = this.getTotalColWidth();
    var scale = availableWidth / currentTotalWidth;

    // size all cols except the last by the scale
    for (var i = 0; i < (this.visibleColumns.length - 1); i++) {
        var column = this.visibleColumns[i];
        var newWidth = parseInt(column.actualWidth * scale);
        column.actualWidth = newWidth;
    }

    // size the last by whats remaining (this avoids rounding errors that could
    // occur with scaling everything, where it result in some pixels off)
    var pixelsLeftForLastCol = availableWidth - this.getTotalColWidth();
    var lastColumn = this.visibleColumns[this.visibleColumns.length - 1];
    lastColumn.actualWidth += pixelsLeftForLastCol;

    // widths set, refresh the gui
    this.angularGrid.refreshHeaderAndBody();
};

// private
// build groups recursively
ColumnController.prototype.buildGroups = function() {
    // if not grouping by headers, do nothing
    if (!this.gridOptionsWrapper.isGroupHeaders()) {
        this.columnGroups = null;
        return;
    }

    // split the columns into groups
    var currentGroup = null;
    this.columnGroups = [];
    var that = this;

    var lastColWasPinned = true;

    this.columns.forEach(function(column) {
		lastColWasPinned=lastColWasPinned&&column.pinned;
		currentGroup = that.addGroupToStack(column.colDef.group,lastColWasPinned);
		currentGroup.addColumn(column);		
    });
	var level=this.groupLevel(this.columnGroups);	
	this.extructure(this.columnGroups,level);  
	
	this.gridOptionsWrapper.setHeaderHeight((level+1));
	this.angularGrid.setHeaderHeight();
	
};

//lagb
//makes that the group have size levels if level is less that size
ColumnController.prototype.extructure = function(columnGroups,size) {

for( var x= 0;x<columnGroups.length;x++){
	var miGroup=columnGroups[x];
	this.extructure(miGroup.subGroups,size-1);
	if(miGroup.allColumns.length>0&& size>1){
		var groups=[];
		var c=size-1;	                	
		for(var j =0 ;j<miGroup.allColumns.length;j++){
			var currentGroup=miGroup;
			for(var i=0;i<c;i++){
	                        var currGroup =new ColumnGroup(currentGroup.pinned," ");
                        	currGroup.parentGroup=currentGroup;
                	        currentGroup.subGroups.push(currGroup);
        	                currentGroup =currGroup;
	                }
			groups.push(currentGroup);
		}

		for(var i=0;i<groups.length;i++){
		groups[i].allColumns.push(miGroup.allColumns[i]);
		}
		miGroup.allColumns=[];
/*		if(currentGroup!=miGroup){
			currentGroup.allColumns=miGroup.allColumns;
		}
*/
	}		
}
};

//lagb
ColumnController.prototype.groupLevel = function(groups, level) {
    if(level==undefined) level=0;
    var out=level;
    for(var i=0;i< groups.length;i++){        
        var c1=1+this.groupLevel(groups[i].subGroups,level);  
        groups[i].level=c1;
        if(c1>out) out=c1;           
    }
    return out;
};

//lagb
ColumnController.prototype.groupLevel = function(groups, level) {
    if(level==undefined) level=0;
    var out=level;
    for(var i=0;i< groups.length;i++){        
        var c1=1+this.groupLevel(groups[i].subGroups,level);  
        groups[i].level=c1;
        if(c1>out) out=c1;           
    }
    return out;
};

// private
// if it has grouped  calculeExpandable and visibleColumns to all
ColumnController.prototype.updateGroups = function() {
    // if not grouping by headers, do nothing
    if (!this.gridOptionsWrapper.isGroupHeaders()) {
        return;
    }
    this.updateGroupList(this.columnGroups);    
};

// if it has grouped  calculeExpandable and visibleColumns to all recursively
ColumnController.prototype.updateGroupList = function(groupList) {   
    for (var i = 0; i < groupList.length; i++) {
        var group = groupList[i];
        group.calculateExpandable();
        group.calculateVisibleColumns();
	this.updateGroupList(group.subGroups);
    }
};

// private
ColumnController.prototype.buildColumns = function(columnDefs) {
    this.columns = [];
    var that = this;
    var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
    if (columnDefs) {
        for (var i = 0; i < columnDefs.length; i++) {
            var colDef = columnDefs[i];
            // this is messy - we swap in another col def if it's checkbox selection - not happy :(
            if (colDef === 'checkboxSelection') {
                colDef = that.selectionRendererFactory.createCheckboxColDef();
            }
            var pinned = pinnedColumnCount > i;
            var column = new Column(colDef, i, pinned);
            that.columns.push(column);
        }
    }
};

// private
// set the actual widths for each col
ColumnController.prototype.ensureEachColHasSize = function() {
    var defaultWidth = this.gridOptionsWrapper.getColWidth();
    if (typeof defaultWidth !== 'number' || defaultWidth < constants.MIN_COL_WIDTH) {
        defaultWidth = 200;
    }
    this.columns.forEach(function(colDefWrapper) {
        var colDef = colDefWrapper.colDef;
        if (colDefWrapper.actualWidth) {
            // if actual width already set, do nothing
            return;
        } else if (!colDef.width) {
            // if no width defined in colDef, default to 200
            colDefWrapper.actualWidth = defaultWidth;
        } else if (colDef.width < constants.MIN_COL_WIDTH) {
            // if width in col def to small, set to min width
            colDefWrapper.actualWidth = constants.MIN_COL_WIDTH;
        } else {
            // otherwise use the provided width
            colDefWrapper.actualWidth = colDef.width;
        }
    });
};

// private
// call with true (pinned), false (not-pinned) or undefined (all columns)
ColumnController.prototype.getTotalColWidth = function(includePinned) {
    var widthSoFar = 0;
    var pinedNotImportant = typeof includePinned !== 'boolean';

    this.visibleColumns.forEach(function(column) {
        var includeThisCol = pinedNotImportant || column.pinned === includePinned;
        if (includeThisCol) {
            widthSoFar += column.actualWidth;
        }
    });

    return widthSoFar;
};

//lagb
ColumnController.prototype.addGroupToStack = function(group,pinned) {
    var groupsList =this.model.getColumnGroups();
    var parentGroup=null;
    if (typeof group == 'object' && group.parent != null) {
         parentGroup = this.addGroupToStack(group.parent);
         groupsList=parentGroup.subGroups;
    }    
    var currGroup=null;	
    //  groupsList.forEach(function(columnGroup){
    if(groupsList.length>0&&groupsList[groupsList.length-1].name==(typeof group == 'object'?group.name:group) && groupsList[groupsList.length-1].name)
        currGroup=groupsList[groupsList.length-1];
    //  });    
    if(currGroup==null){
        currGroup =new ColumnGroup(pinned,(typeof group == 'object'?group.name:group) );
        currGroup.parentGroup=parentGroup;
        groupsList.push(currGroup);
    }
    return currGroup;
};


function ColumnGroup(pinned, name) {
    this.pinned = pinned;
    this.name = name;
    this.allColumns = [];
    this.subGroups = [];
    this.visibleColumns = [];
    this.expandable = false; // whether this group can be expanded or not
    this.expanded = false;
    this.level=0;
    this.parentGroup=null;
}

ColumnGroup.prototype.addColumn = function(column) {
    this.allColumns.push(column);
};

ColumnGroup.prototype.push = function(column) {
    this.subGroups.push(column);
};

// need to check that this group has at least one col showing when both expanded and contracted.
// if not, then we don't allow expanding and contracting on this group
ColumnGroup.prototype.calculateExpandable = function() {
    // want to make sure the group doesn't disappear when it's open
    var atLeastOneShowingWhenOpen = false;
    // want to make sure the group doesn't disappear when it's closed
    var atLeastOneShowingWhenClosed = false;
    // want to make sure the group has something to show / hide
    var atLeastOneChangeable = false;
    for (var i = 0, j = this.allColumns.length; i < j; i++) {
        var column = this.allColumns[i];
        if (column.colDef.groupShow === 'open') {
            atLeastOneShowingWhenOpen = true;
            atLeastOneChangeable = true;
        } else if (column.colDef.groupShow === 'closed') {
            atLeastOneShowingWhenClosed = true;
            atLeastOneChangeable = true;
        } else {
            atLeastOneShowingWhenOpen = true;
            atLeastOneShowingWhenClosed = true;
        }
    }

    this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
    this.subGroups.forEach(function (group){
	group.calculateExpandable();	
    });
};

ColumnGroup.prototype.calculateVisibleColumns = function() {
    // clear out last time we calculated
    this.visibleColumns = [];
    // it not expandable, everything is visible
    if (!this.expandable) {
       this.pushAllToVisibleColumns();//visibleColumns = this.allColumns;
       return;
    }
    // and calculate again
    for (var i = 0, j = this.allColumns.length; i < j; i++) {
        var column = this.allColumns[i];
        switch (column.colDef.groupShow) {
            case 'open':
                // when set to open, only show col if group is open
                if (this.expanded) {
                    this.visibleColumns.push(column);
                }
                break;
            case 'closed':
                // when set to open, only show col if group is open
                if (!this.expanded) {
                    this.visibleColumns.push(column);
                }
                break;
            default:
                // default is always show the column
                this.visibleColumns.push(column);
                break;
        }
    }
};

ColumnGroup.prototype.pushAllToVisibleColumns = function() {	
	this.visibleColumns = this.allColumns;
	this.subGroups.forEach(function (group){
		group.pushAllToVisibleColumns();
	});
}

ColumnGroup.prototype.addToVisibleColumns = function(allVisibleColumns) {
    for (var i = 0; i < this.visibleColumns.length; i++) {
        var column = this.visibleColumns[i];
        allVisibleColumns.push(column);
    }
};

function Column(colDef, index, pinned) {
    this.colDef = colDef;
    this.index = index;
    this.pinned = pinned;
    // in the future, the colKey might be something other than the index
    this.colKey = index;
}

module.exports = ColumnController;

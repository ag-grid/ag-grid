function HeaderComponent() {
}

HeaderComponent.prototype.init = function (agParams){
    this.agParams = agParams;
    this.eGui = document.createElement('div');
    this.eGui.className = "headerComponent";
    this.eGui.innerHTML = ''+
        '<div class="customHeaderMenuButton"><i class="fa ' + this.agParams.menuIcon + '"></i></div>' +
        '<div class="customHeaderLabel">' + this.agParams.displayName + '</div>' +
        '<div class="customSortDownLabel inactive"><i class="fa fa-long-arrow-down"></i></div>' +
        '<div class="customSortUpLabel inactive"><i class="fa fa-long-arrow-up"></i></div>' +
        '<div class="customSortRemoveLabel inactive"><i class="fa fa-times"></i></div>';

    this.eMenuButton = this.eGui.querySelector(".customHeaderMenuButton");
    this.eSortDownButton = this.eGui.querySelector(".customSortDownLabel");
    this.eSortUpButton = this.eGui.querySelector(".customSortUpLabel");
    this.eSortRemoveButton = this.eGui.querySelector(".customSortRemoveLabel");


    if (this.agParams.enableMenu){
        this.onMenuClickListener = this.onMenuClick.bind(this);
        this.eMenuButton.addEventListener('click', this.onMenuClickListener);
    }else{
        this.eGui.removeChild(this.eMenuButton);
    }

    if (this.agParams.enableSorting){
        this.onSortAscRequestedListener = this.onSortRequested.bind(this, 'asc');
        this.eSortDownButton.addEventListener('click', this.onSortAscRequestedListener);
        this.onSortDescRequestedListener = this.onSortRequested.bind(this, 'desc');
        this.eSortUpButton.addEventListener('click', this.onSortDescRequestedListener);
        this.onRemoveSortListener = this.onSortRequested.bind(this, '');
        this.eSortRemoveButton.addEventListener('click', this.onRemoveSortListener);


        this.onSortChangedListener = this.onSortChanged.bind(this);
        this.agParams.column.addEventListener('sortChanged', this.onSortChangedListener);
        this.onSortChanged();
    } else {
        this.eGui.removeChild(this.eSortDownButton);
        this.eGui.removeChild(this.eSortUpButton);
        this.eGui.removeChild(this.eSortRemoveButton);
    }
};

HeaderComponent.prototype.onSortChanged = function (){
    function deactivate (toDeactivateItems){
        toDeactivateItems.forEach(function (toDeactivate){toDeactivate.className = toDeactivate.className.split(' ')[0]});
    }

    function activate (toActivate){
        toActivate.className = toActivate.className + " active";
    }

    if (this.agParams.column.isSortAscending()){
        deactivate([this.eSortUpButton, this.eSortRemoveButton]);
        activate (this.eSortDownButton)
    } else if (this.agParams.column.isSortDescending()){
        deactivate([this.eSortDownButton, this.eSortRemoveButton]);
        activate (this.eSortUpButton)
    } else {
        deactivate([this.eSortUpButton, this.eSortDownButton]);
        activate (this.eSortRemoveButton)
    }
};

HeaderComponent.prototype.getGui = function (){
    return this.eGui;
};

HeaderComponent.prototype.onMenuClick = function () {
    this.agParams.showColumnMenu (this.eMenuButton);
};

HeaderComponent.prototype.onSortRequested = function (order, event) {
    this.agParams.setSort (order, event.shiftKey);
};

HeaderComponent.prototype.destroy = function () {
    if (this.onMenuClickListener){
        this.eMenuButton.removeEventListener('click', this.onMenuClickListener)
    }
    this.eSortDownButton.removeEventListener('click', this.onSortRequestedListener);
    this.eSortUpButton.removeEventListener('click', this.onSortRequestedListener);
    this.eSortRemoveButton.removeEventListener('click', this.onSortRequestedListener);
    this.agParams.column.removeEventListener('sortChanged', this.onSortChangedListener);
};

export default HeaderComponent;
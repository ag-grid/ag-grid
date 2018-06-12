function CustomDateComponent() {
}

CustomDateComponent.prototype.init = function (params) {
    var template =
        "   <span class='reset'>x</span>" +
        "   <input class='dd' placeholder='dd'maxLength='2'/>" +
        "   <span class='divider'>/</span>" +
        "   <input class='mm' placeholder='mm' maxLength='2'/>" +
        "   <span class='divider'>/</span>" +
        "   <input class='yyyy' placeholder='yyyy' maxLength='4'/>";

    this.params = params;

    this.eGui = document.createElement('div');
    this.eGui.className = 'filter';
    this.eGui.innerHTML = template;

    this.eReset = this.eGui.querySelector('.reset');
    this.eDD = this.eGui.querySelector('.dd');
    this.eMM = this.eGui.querySelector('.mm');
    this.eYYYY = this.eGui.querySelector('.yyyy');

    this.eReset.addEventListener('click', this.onResetDate.bind(this));
    this.eDD.addEventListener('input', this.onDateChanged.bind(this, 'dd'));
    this.eMM.addEventListener('input', this.onDateChanged.bind(this, 'mm'));
    this.eYYYY.addEventListener('input', this.onDateChanged.bind(this, 'yyyy'));

    this.date = null;
};

CustomDateComponent.prototype.getGui = function () {
    return this.eGui;
};


CustomDateComponent.prototype.onResetDate = function () {
    this.setDate(null);
    this.params.onDateChanged();
};

CustomDateComponent.prototype.onDateChanged = function (on, newValue) {
    this.date = this.parseDate(
        this.eDD.value,
        this.eMM.value,
        this.eYYYY.value
    );
    this.params.onDateChanged();
};

CustomDateComponent.prototype.getDate = function () {
    return this.date;
};

CustomDateComponent.prototype.setDate = function (date) {
    if (!date) {
        this.eDD.value = '';
        this.eMM.value = '';
        this.eYYYY.value = '';
        this.date = null;
    } else {
        this.eDD.value = date.getDate() + '';
        this.eMM.value = (date.getMonth() + 1) + '';
        this.eYYYY.value = date.getFullYear() + '';
        this.date = date;
    }
};

//*********************************************************************************
//          INTERNAL LOGIC
//*********************************************************************************

CustomDateComponent.prototype.parseDate = function (dd, mm, yyyy) {
    //If any of the three input date fields are empty, stop and return null
    if (dd.trim() === '' || mm.trim() === '' || yyyy.trim() === '') {
        return null;
    }

    let day = Number(dd);
    let month = Number(mm);
    let year = Number(yyyy);

    let date = new Date(year, month - 1, day);

    //If the date is not valid
    if (isNaN(date.getTime())) {
        return null;
    }

    //Given that new Date takes any garbage in, it is possible for the user to specify a new Date
    //like this (-1, 35, 1) and it will return a valid javascript date. In this example, it will
    //return Sat Dec 01    1 00:00:00 GMT+0000 (GMT) - Go figure...
    //To ensure that we are not letting non sensical dates to go through we check that the resultant
    //javascript date parts (month, year and day) match the given date fields provided as parameters.
    //If the javascript date parts don't match the provided fields, we assume that the input is nonsensical
    // ... ie: Day=-1 or month=14, if this is the case, we return null
    //This also protects us from non sensical dates like dd=31, mm=2 of any year
    if (date.getDate() !== day || date.getMonth() + 1 !== month || date.getFullYear() !== year) {
        return null;
    }

    return date;
};
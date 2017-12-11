import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
    selector: 'app-loading-overlay',
    template: `
        <div class="filter">
            <span class="reset" (click)="onResetDate()">x</span>
            <input class="dd" (ngModelChange)="onDateChanged('dd', $event)" placeholder="dd" [(ngModel)]="dd" maxLength="2"/>
            <span class="divider">/</span>
            <input class="mm" (ngModelChange)="onDateChanged('mm', $event)" placeholder="mm" [(ngModel)]="mm" maxLength="2"/>
            <span class="divider">/</span>
            <input class="yyyy" (ngModelChange)="onDateChanged('yyyy', $event)" placeholder="yyyy" [(ngModel)]="yyyy" maxLength="4"/>
        </div>
    `,
    styles: [
        `
        .filter {
            margin: 0px
        }
        
        .dd {
            width: 20px
        }
        
        .mm {
            width: 25px
        }
        
        .yyyy {
            width: 35px
        }
        
        .divider {
            margin: 0px;
            padding: 0px
        }

        .reset {
            padding: 2px;
            background-color: red;
            border-radius: 3px;
            font-size: 10px;
            margin-right: 5px;
            color: white;
        }
    `
    ]
})
export class CustomDateComponent {
    private date: Date;
    private params: any;
    public dd: string = '';
    public mm: string = '';
    public yyyy: string = '';

    agInit(params: any): void {
        this.params = params;
    }

    ngOnDestroy() {
        console.log(`Destroying DateComponent`);
    }

    onResetDate() {
        this.setDate(null);
        this.params.onDateChanged();
    }

    onDateChanged(on: string, newValue: string) {
        this.date = this.parseDate(
            on === 'dd' ? newValue : this.dd,
            on === 'mm' ? newValue : this.mm,
            on === 'yyyy' ? newValue : this.yyyy
        );
        this.params.onDateChanged();
    }

    getDate(): Date {
        return this.date;
    }

    setDate(date: Date): void {
        if (date == null) {
            this.dd = '';
            this.mm = '';
            this.yyyy = '';
            this.date = null;
        } else {
            this.dd = date.getDate() + '';
            this.mm = (date.getMonth() + 1) + '';
            this.yyyy = date.getFullYear() + '';
            this.date = date;
        }
    }

    //*********************************************************************************
    //          INTERNAL LOGIC
    //*********************************************************************************

    parseDate(dd, mm, yyyy) {
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
        if (date.getDate() != day || date.getMonth() + 1 != month || date.getFullYear() != year) {
            return null;
        }

        return date;
    }
}
export { };

declare global {

    //Copy of this interface is present in shared-types/generators so that it can be added as a string to the code files inline 
    // when it is use. Please keep the two in sync if you are adding a property!

    interface IOlympicData {
        athlete: string,
        age: number,
        country: string,
        year: number,
        date: string,
        sport: string,
        gold: number,
        silver: number,
        bronze: number,
        total: number
    }

}


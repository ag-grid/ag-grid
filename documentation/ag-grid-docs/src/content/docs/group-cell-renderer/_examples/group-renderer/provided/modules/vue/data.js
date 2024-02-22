function getData() {
    const rowData = [];

    const irelandCities = ['Dublin', 'Galway', 'Cork'];
    const ukCities = ['London', 'Bristol', 'Manchester', 'Liverpool'];
    const usaCities = ['New York', 'Boston', 'L.A.', 'San Fransisco', 'Detroit'];
    const middleEarthCities = ['The Shire', 'Rohan', 'Rivendell', 'Mordor'];
    const midkemiaCities = ['Darkmoor', 'Crydee', 'Elvandar', 'LaMut', 'Ylith'];

    const addCity = function (country, type, city) {
        rowData.push({country: country, type: type, city: city})
    };

    irelandCities.forEach(addCity.bind(null, 'Ireland', 'Non Fiction'))
    ukCities.forEach(addCity.bind(null, 'United Kingdom', 'Non Fiction'))
    usaCities.forEach(addCity.bind(null, 'USA Cities', 'Non Fiction'))
    middleEarthCities.forEach(addCity.bind(null, 'Middle Earth', 'Fiction'))
    midkemiaCities.forEach(addCity.bind(null, 'Midkemia', 'Fiction'))

    return rowData
}

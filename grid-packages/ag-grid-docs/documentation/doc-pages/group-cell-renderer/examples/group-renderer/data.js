function getData() {
    var rowData = []

    var irelandCities = ['Dublin', 'Galway', 'Cork']
    var ukCities = ['London', 'Bristol', 'Manchester', 'Liverpool']
    var usaCities = ['New York', 'Boston', 'L.A.', 'San Fransisco', 'Detroit']
    var middleEarthCities = ['The Shire', 'Rohan', 'Rivendell', 'Mordor']
    var midkemiaCities = ['Darkmoor', 'Crydee', 'Elvandar', 'LaMut', 'Ylith']

    var addCity = function (country, type, city) {
        rowData.push({ country: country, type: type, city: city })
    }

    irelandCities.forEach(addCity.bind(null, 'Ireland', 'Non Fiction'))
    ukCities.forEach(addCity.bind(null, 'United Kingdom', 'Non Fiction'))
    usaCities.forEach(addCity.bind(null, 'USA Cities', 'Non Fiction'))
    middleEarthCities.forEach(addCity.bind(null, 'Middle Earth', 'Fiction'))
    midkemiaCities.forEach(addCity.bind(null, 'Midkemia', 'Fiction'))

    return rowData
}
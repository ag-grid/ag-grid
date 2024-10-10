const LINUX_DISTROS = [
    'Manjaro',
    'MX Linux',
    'Mint',
    'elementary',
    'Ubuntu',
    'Debian',
    'Fedora',
    'Solus',
    'openSUSE',
    'Zorin',
    'ReactOS',
    'CentOS',
    'Arch',
    'KDE neon',
    'deepin',
    'antiX',
    'Antergos',
    'Kali',
    'Parrot',
    'Lite',
    'ArcoLinux',
    'FreeBSD',
    'Ubuntu Kylin',
    'Lubuntu',
    'SparkyLinux',
    'Peppermint',
    'SmartOS',
    'PCLinuxOS',
    'Mageia',
    'Endless',
];

const CITIES = [
    'Tokyo',
    'Jakarta',
    'Delhi',
    'Manila',
    'Seoul',
    'Shanghai',
    'Mumbai',
    'New York',
    'Beijing',
    'Sao Paulo',
    'Mexico City',
    'Guangzhou',
    'Dhaka',
    'Osaka-Kobe-Kyoto',
    'Moscow',
    'Cairo',
    'Bangkok',
    'Los Angeles',
    'Buenos Aires',
];

const LAPTOPS = ['Hewlett Packard', 'Lenovo', 'Dell', 'Asus', 'Apple', 'Acer', 'Microsoft', 'Razer'];

let idCounter = 0;

function letter(i: number) {
    return 'abcdefghijklmnopqrstuvwxyz'.substring(i, i + 1);
}

function randomLetter() {
    return letter(Math.floor(Math.random() * 26 + 1));
}

export function createDataItem(
    name: string,
    distro: string,
    laptop: string,
    city: string,
    value: number,
    idToUse: number | undefined = undefined
): any {
    const id = idToUse != null ? idToUse : idCounter++;
    return {
        id: id,
        name: name,
        city: city,
        distro: distro,
        laptop: laptop,
        value: value,
    };
}

export function getData() {
    const myRowData = [];
    for (let i = 0; i < 10000; i++) {
        const name =
            'Mr ' +
            randomLetter().toUpperCase() +
            ' ' +
            randomLetter().toUpperCase() +
            randomLetter() +
            randomLetter() +
            randomLetter() +
            randomLetter();
        const city = CITIES[i % CITIES.length];
        const distro = LINUX_DISTROS[i % LINUX_DISTROS.length] + ' v' + Math.floor(Math.random() * 100 + 1) / 10;
        const university = LAPTOPS[i % LAPTOPS.length];
        const value = Math.floor(Math.random() * 100) + 10; // between 10 and 110
        myRowData.push(createDataItem(name, distro, university, city, value));
    }
    return myRowData;
}

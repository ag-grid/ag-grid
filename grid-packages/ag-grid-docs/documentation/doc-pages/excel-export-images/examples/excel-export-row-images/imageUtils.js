function createBlob(response) {
    return response.blob();
}

function fromBlobToBase64(blob) {
    return new Promise(function(res) {
        var reader = new FileReader();
        reader.onloadend = function() {
            res(reader.result);
        };
        reader.readAsDataURL(blob);
    });
}

function createBase64ImageFromURL(url) {
    return fetch(url).then(createBlob).then(function(blob) {
        return fromBlobToBase64(blob);
    });
}

function createBase64ImagesFromURLArray(arr) {
    var map = new Map();
    var promiseArray = arr.reduce(function(promises, currentUrl) {
        if (!map.has(currentUrl)) {
            var promise = createBase64ImageFromURL(currentUrl)
            promise.then(function(base64) {
                map.set(currentUrl, base64);
            });
            promises.push(promise)
        }

        return promises;
    }, []);
    
    return Promise.all(promiseArray).then(function() { return map; });
}

// Example specific code
function createCountryCodeMap(countryCodeObject) {
    return fetch('https://flagcdn.com/en/codes.json')
    .then(function(response) { return response.json(); })
    .then(function(codes) {
        Object.keys(codes).forEach(function(code) {
            countryCodeObject[codes[code]] = code;
        });
        return countryCodeObject;
    })
}

function createBase64FlagsFromResponse(response, countryCodeObject, base64FlagsObject) {
    var urlPrefix = 'https://flagcdn.com/w20/';
    var extension = '.png';
    return response.json()
        .then(function(data) {
            return createCountryCodeMap(countryCodeObject).then(function() {
                return data.filter(function (rec) { return rec.country != null; });
            });
        })
        .then(function(data) {
            var urls = data.map(function(rec) { 
                var countryCode = countryCodeObject[rec.country];
                return urlPrefix + countryCode + extension;
            })
            return createBase64ImagesFromURLArray(urls).then(function(map) {
                map.forEach(function(value, key) {
                    var code = key.replace(urlPrefix, '').replace(extension, '');
                    base64FlagsObject[code] = value;
                });
                return data;
            });
        }).then(function(data){ return data; });
}
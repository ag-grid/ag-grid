var mockedFiles = [];

var originalFetch = System.fetch;

System.fetch = function(metadata) {
    var requestedFile = metadata.name;

    var mockedFile = mockedFiles.find(function(mockedFile) {
        return requestedFile.endsWith(mockedFile.name);
    });

    if (mockedFile) {
        return mockedFile.content;
    } else {
        return originalFetch.apply(this, Array.prototype.slice.call(arguments));
    }
};

function httpFetch(location, callback) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            callback(xhr.responseText);
        }
    };

    xhr.open('GET', location, true);
    xhr.send(null);
}

function registerMockedFile(file, callback) {
    var contents = [];
    var sourceUrls = file.urls;

    function next() {
        if (sourceUrls.length) {
            var url = sourceUrls.shift();
            if (!url) {
                contents.push('');
                next();
            } else {
                httpFetch(url, function(content) {
                    contents.push(content);
                    next();
                });
            }
        } else {
            var content = file.transform ? file.transform(contents) : contents[0];
            mockedFiles.push({name: file.name, content: content});
            callback();
        }
    }

    next();
}

function registerMockedFiles(files, callback) {
    function next() {
        if (!files.length) {
            callback();
        } else {
            registerMockedFile(files.shift(), next);
        }
    }

    next();
}

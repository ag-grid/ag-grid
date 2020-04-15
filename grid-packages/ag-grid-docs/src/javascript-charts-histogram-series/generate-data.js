#!/usr/bin/env node

// script to generate random example data.js for histogram series examples like:
// ./generate-data.js > example/data.js

// pulls numbers from a normal distribution
function normal(mean, sigma, minCutoff, maxCutoff) {
    // The Marsaglia Polar method
    var s, u, v, norm;

    do {
        // U and V are from the uniform distribution on (-1, 1)
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;

        s = u * u + v * v;
    } while (s >= 1);

    // Compute the standard normal variate
    norm = u * Math.sqrt(-2 * Math.log(s) / s);

    // Shape and scale
    var result = sigma * norm + mean;

    if( result < minCutoff ) {
        return normal(mean, sigma, minCutoff, maxCutoff);
    }
    if( result > maxCutoff ) {
        return normal(mean, sigma, minCutoff, maxCutoff);
    }
    return result;
}

var histogramDataLength = 1000;
var histogramData = Array.apply(null, Array(histogramDataLength)).map(function() {
    var age = normal(24, 3, 16, 80);

    return {
        age: age,
        time: 600 + 5 * age - normal(600, 60, 400, 8000),
        winnings: normal(200, 50, 0, Number.POSITIVE_INFINITY)
    };
});

process.stdout.write('var histogramData = ');
process.stdout.write(JSON.stringify( histogramData, null, 4 ));
process.stdout.write(';');
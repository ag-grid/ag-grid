#!/usr/bin/env node

// script to simplify json examples found on the internet by reducing the number of fields.
// use like:
//
// $ cat autos_json.json | ./simplify_data > simple-histogram

const stdin = process.stdin;
const stdout = process.stdout;
const inputChunks = [];

// list of properties to keep from each datum
const propertiesToKeep = ["engine-size"];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});


stdin.on('end', function () {
    const inputJSON = inputChunks.join("");
    const parsedData = JSON.parse(inputJSON);
    const filteredData = parsedData
            .map( datum =>
                Object.fromEntries(
                    Object.entries(datum).filter( ([key]) => propertiesToKeep.includes(key) )
                )
            );

    stdout.write('var data = ');
    stdout.write(JSON.stringify(filteredData, null, 4));
    stdout.write(';\n');
});

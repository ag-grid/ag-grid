var data = [
    { name: "E", value: 0.12702 },
    { name: "T", value: 0.09056 },
    { name: "A", value: 0.08167 },
    { name: "O", value: 0.07507 },
    { name: "I", value: 0.06966 },
    { name: "N", value: 0.06749 },
    { name: "S", value: 0.06327 },
    { name: "H", value: 0.06094 },
    { name: "R", value: 0.05987 },
    { name: "D", value: 0.04253 },
    { name: "L", value: 0.04025 },
    { name: "C", value: 0.02782 },
    { name: "U", value: 0.02758 },
    { name: "M", value: 0.02406 },
    { name: "W", value: 0.0236 },
    { name: "F", value: 0.02288 },
    { name: "G", value: 0.02015 },
    { name: "Y", value: 0.01974 },
    { name: "P", value: 0.01929 },
    { name: "B", value: 0.01492 },
    { name: "V", value: 0.00978 },
    { name: "K", value: 0.00772 },
    { name: "J", value: 0.00153 },
    { name: "X", value: 0.0015 },
    { name: "Q", value: 0.00095 },
    { name: "Z", value: 0.00074 },
].map(function (v) {
    v.value2 = v.value * Math.random();
    v.value3 = v.value * Math.random();
    v.value4 = 0.1 + Math.random() * 0.1;
    v.value5 = 0.1 + Math.random() * 0.2;
    v.value6 = 0.2 + Math.random() * 0.2;
    v.value7 = 0.15 + Math.random() * 0.10;
    v.value8 = 0.10 + Math.random() * 0.10;
    return v;
});
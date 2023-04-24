var lastTime = new Date('07 Jan 2020 13:25:00 GMT').getTime();
var data = [];
for (var i = 0; i < 20; i++) {
    data.push({
        time: new Date(lastTime += 1000),
        voltage: 1.1 + Math.random() / 2
    });
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var csv_parse_1 = require("csv-parse");
var node_process_1 = require("node:process");
var Order = /** @class */ (function () {
    function Order(id, start, duration, price) {
        this.id = id;
        this.start = start;
        this.duration = duration;
        this.price = price;
    }
    return Order;
}());
var selection = function (orders, order) {
    var start = order.start;
    var end = start + order.duration;
    var year = Math.floor(start / 1000);
    var year_end = (year * 1000) + 365;
    if (end > year_end) {
        var days = end - year_end;
        end = ((year + 1) * 1000) + days;
    }
    var result = [];
    orders.filter(function (order) { return order.start >= end; }).forEach(function (order) {
        result.push(order);
    });
    return result;
};
var rev = function (orders) {
    if (orders.length === 0) {
        return 0;
    }
    var order = orders[0];
    var comp = selection(orders.slice(1), order);
    var rc = rev(comp);
    var rn = rev(orders.slice(1));
    return (order.price + rc) > rn ? (order.price + rc) : rn;
};
(function () {
    var tot = 0;
    var order = new Order('foo', 0, 10, 120);
    var dataFile = node_process_1.env['LAGS_ORDER_FILE'];
    if (dataFile === undefined) {
        console.log("which file? set LAGS_ORDER_FILE var\n");
        return;
    }
    var csvFilePath = path.resolve(__dirname, dataFile);
    var headers = ['id', 'start', 'duration', 'price'];
    var fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    (0, csv_parse_1.parse)(fileContent, {
        delimiter: ',',
        from_line: 2,
        columns: headers,
    }, function (error, records) {
        if (error) {
            console.error(error);
        }
        var orders = records.map(function (record) {
            var order = new Order(record.id, parseInt(record.start), parseInt(record.duration), parseInt(record.price));
            return order;
        });
        orders.sort(function (a, b) { return a.start - b.start; });
        for (var i = 0; i < orders.length - 1; i++) {
            console.assert(orders[i].start <= orders[i + 1].start, "the list should be ordered");
            tot += 1;
        }
        console.log("".concat(tot + 1, " ").concat(rev(orders)));
    });
})();

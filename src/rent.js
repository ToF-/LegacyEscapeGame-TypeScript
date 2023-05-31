"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var csv_parse_1 = require("csv-parse");
var Order = /** @class */ (function () {
    function Order(id, start, duration, price) {
        this.id = id;
        this.start = start;
        this.duration = duration;
        this.price = price;
    }
    return Order;
}());
(function () {
    var dataFile = process.env.LAGS_ORDER_FILE;
    var csvFilePath = path.resolve(__dirname, dataFile);
    var headers = ['Id', 'Start', 'Duration', 'Price'];
    var fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    (0, csv_parse_1.parse)(fileContent, {
        delimiter: ',',
        columns: headers,
    }, function (error, result) {
        if (error) {
            console.error(error);
        }
        console.log(result);
    });
});

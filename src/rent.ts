import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { env } from 'node:process';

class Order {
    id: string;
    start: number;
    duration: number;
    price: number;

    constructor(id: string, start: number, duration: number, price: number) {
        this.id = id;
        this.start = start;
        this.duration = duration;
        this.price = price;
    }
}


const selection = (orders: Order[], order: Order): Order[] => {
    const start = order.start;
    var end = start + order.duration;
    const year = Math.floor(start / 1000);
    const year_end = (year * 1000) + 365;
    if(end > year_end) {
        const days = end - year_end;
        end = ((year + 1) * 1000) + days;
    }
    var result: Order[] = []
    orders.filter((order) => order.start >= end).forEach((order) => {
        result.push(order);
    });
    return result;
}

const rev = (orders: Order[]): number => {
    if(orders.length===0) {
        return 0;
    }
    var order: Order = orders[0];
    var comp: Order[] = selection(orders.slice(1), order);
    var rc: number = rev(comp);
    var rn: number = rev(orders.slice(1));
    return (order.price + rc) > rn ? (order.price + rc) : rn;
}

(() => {
    var tot = 0;
    var order: Order = new Order('foo', 0, 10, 120);
    const dataFile = env['LAGS_ORDER_FILE'];
    if(dataFile === undefined) {
        console.log("which file? set LAGS_ORDER_FILE var\n");
        return;
    }
    const csvFilePath = path.resolve(__dirname, dataFile as string);
    const headers = ['id', 'start', 'duration', 'price'];
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    parse(fileContent, {
        delimiter: ',',
        from_line: 2,
        columns: headers,
    }, (error, records) => {
        if(error) {
            console.error(error);
        }
        const orders : Order[] = records.map((record:any) => {
            const order : Order = new Order(record.id, parseInt(record.start), parseInt(record.duration), parseInt(record.price));
            return order;
        });
        orders.sort((a, b) => a.start - b.start);
        for (let i=0; i < orders.length -1; i++) {
            console.assert(orders[i].start <= orders[i+1].start, "the list should be ordered");
            tot += 1;
        }
        console.log(`${tot+1} ${rev(orders)}`);
    });
})();


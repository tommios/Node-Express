const path = require('path');
const fs = require('fs');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'card.json'
);

class Card {
    static async add(course) {
        const card = await Card.fetch();

        const index = card.courses.findIndex(c => c.id === course.id);
        const candidate = card.courses[index];

        if (candidate) {
            // Если курс уже есть в корзине
            candidate.count++;
            card.courses[index] = candidate;
        }
        else {
            // Нужно добавить новый курс
            course.count = 1;
            card.courses.push(course);
        }

        card.price += +course.price;

        return new Promise((resolve, reject) => {
            fs.writeFile(
                p,
                JSON.stringify(card),
                (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                })
        });
    }

    static async fetch() {
        return new Promise((resolve, reject) => {
            fs.readFile(
                p,
                'utf-8',
                (err, content) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(JSON.parse(content));
                    }
                });
        });
    }
}


module.exports = Card;
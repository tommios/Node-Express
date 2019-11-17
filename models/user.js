const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    cart: {   // Корзина пользователя
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true
                }
            }
        ]
    }

});

// Определяем метод добавления в корзину, 
// который выносится прямо в объект пользователя
userSchema.methods.addToCart = function (course) {
    //Клонируем массив items
    // const items = this.cart.items.concat();
    const items = [...this.cart.items];         // То же самое, синтаксис ES6
    const index = items.findIndex(c => {
        return c.courseId.toString() === course._id.toString();
    })

    if (index >= 0) {
        items[index].count = items[index].count + 1; // Если такой курс уже есть в корзине
    }
    else {
        items.push({
            count: 1,
            courseId: course._id
        });
    }

    // const newCart = { items: clonedItems };
    // this.cart = newCart;

    this.cart = { items };

    return this.save();
};

module.exports = model('User', userSchema);
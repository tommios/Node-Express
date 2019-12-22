const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    password: {
        type: String,
        required: true
    },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date,
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
    this.cart = { items };
    return this.save();
};

// Определяем метод удаления из корзины
userSchema.methods.removeFromCart = function (id) {
    let items = [...this.cart.items];

    const index = items.findIndex(c => {
        return c.courseId.toString() === id.toString();
    })

    if (items[index].count == 1) {
        items = items.filter(c => c.courseId.toString() !== id.toString())
    }
    else {
        items[index].count--;
    }

    this.cart = { items };
    return this.save();
};

// Очистка корзины после добавления заказа
userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

module.exports = model('User', userSchema);
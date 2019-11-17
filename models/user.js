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
    const clonedItems = [...this.cart.items];         // То же самое, синтаксис ES6
    const index = clonedItems.findIndex(c => {
        return c.courseId.toString() === course._id.toString();
    })

    if (index >= 0) {
        clonedItems[index].count = clonedItems[index].count + 1; // Если такой курс уже есть в корзине
    }
    else {
        clonedItems.push({
            count: 1,
            courseId: course._id
        });
    }

    const newCart = { items: clonedItems };
    this.cart = newCart;
};

module.exports = model('User', userSchema);
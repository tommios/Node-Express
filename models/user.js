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

};

module.exports = model('User', userSchema);
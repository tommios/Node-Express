const { Router } = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', auth, async (req, res) => {
    const orders = await Order.find({ 'user.userId': req.user._id })
        .populate('user.userId');   // !!!

    try {
        res.render('orders', {
            title: 'Заказы',
            isOrders: true,
            orders: orders.map(ord => {
                return {
                    ...ord._doc,
                    price: ord.courses.reduce((total, c) => {
                        return total += c.count * c.course.price
                    }, 0)
                }
            })
        });
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();

        const courses = user.cart.items.map(i => ({
            count: i.count,
            course: { ...i.courseId._doc }
        }));

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses: courses
        })

        await order.save();
        await req.user.clearCart();

        res.redirect('/orders');
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;
const { Router } = require('express');
const Order = require('../models/order');

const router = Router();

router.get('/', async (req, res) => {
    const orders = await Order.find({ 'user.userId': req.user._id })
        .populate('userId');

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

router.post('/', async (req, res) => {
    try {
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();

        const courses = user.cart.items.map(i => ({
            count: i.count,
            course: { ...i.courseId._doc }
        }));

        const order = new Order({
            courses: courses,
            user: {
                name: req.user.name,
                userId: req.user
            }
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
const { Router } = require('express');
const Order = require('../models/order');

const router = Router();

router.get('/', (req, res) => {
    res.render('orders', {
        title: 'Заказы',
        isOrders: true
    })
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
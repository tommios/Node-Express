const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
    res.render('orders', {
        title: 'Заказы',
        isOrders: true
    })
})

router.post('/', (req, res) => {
    res.redirect('/orders');
})

module.exports = router
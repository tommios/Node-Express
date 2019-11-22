const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const path = require('path');
const mongoose = require('mongoose');
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const addRoutes = require('./routes/add');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');

const app = express();

const MONGODB_URI = 'mongodb+srv://artem:yj0FhU4ULU6XoieO@cluster0-2jd7j.mongodb.net/shop';

//#region HandleBars Settings Конфигурация объекта HandleBars

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

// Сохранение сессии в БД MongoDB
const store = new MongoStore({
    collection: 'sessions',
    uri: MONGODB_URI
});

// Регистрируем модуль hbs как движок для рендеринга html-страниц
app.engine('hbs', hbs.engine);

// Указываем дополнительные параметры view engine и views
app.set('view engine', 'hbs');
app.set('views', 'views');

// Регистрируем папку public как статическую
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

// Настройка сессии
app.use(session({
    secret: 'some secret value',
    resave: false,
    saveUninitialized: false,
    store: store
}));

// Добавляем middleware
app.use(varMiddleware);
app.use(userMiddleware);

// Указываем роуты на страницы
app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);

//#endregion

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        });
    }
    catch (err) {
        console.log(err);
    }
}

start();
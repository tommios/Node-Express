const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const addRoutes = require('./routes/add');
const cardRoutes = require('./routes/card');

const app = express();

//#region HandleBars Settings Конфигурация объекта HandleBars

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

// Регистрируем модуль hbs как движок для рендеринга html-страниц
app.engine('hbs', hbs.engine);

// Указываем дополнительные параметры view engine и views
app.set('view engine', 'hbs');
app.set('views', 'views');

// Регистрируем папку public как статическую
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

// Указываем роуты на страницы
app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/card', cardRoutes);

//#endregion

const PORT = process.env.PORT || 3000;

async function start() {
    try{
        const url = 'mongodb+srv://artem:yj0FhU4ULU6XoieO@cluster0-2jd7j.mongodb.net/test?retryWrites=true&w=majority';
        await mongoose.connect(url, { useNewUrlParser: true });
    
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        });
    }
    catch(err){
        console.log(err);
    }
}

start();
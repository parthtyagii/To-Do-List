if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const TODO = require('./models/tasks');
const USER = require('./models/users');
const methodOverride = require('method-override');
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');


//----------------------------------------------------------------------------------------

const dbURL = process.env.Mongo_url || "mongodb://localhost:27017/todoApp";

mongoose.connect(dbURL)
    .then(res => {
        console.log("Mongoose connected!");
    })
    .catch(e => {
        console.log("Mongoose not connected!");
        console.log(e);
    })

//------------------------------------------------------------------------------------------
const store = MongoStore.create({
    mongoUrl: dbURL,
    secret: 'todoApp',
    touchAfter: 24 * 3600,

})

const sessonConfig = {
    name: "session",
    secret: 'todoApp',
    resave: false,
    saveUninitialized: true,
    store
}


app.set('view engine', 'ejs');

app.use(mongoSanitize());
app.use(session(sessonConfig));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
//-----------------------------------------------------------------------------------------



//registering part...
app.get('/register', async (req, res) => {

    // await TODO.deleteMany({});
    // await USER.deleteMany({});

    res.render('register');
})

app.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    const user = new USER({ username, password });
    try {
        await user.save();
        res.redirect('/login');
    }
    catch (e) {
        console.log("Error registering!!");
        next(e);
    }
})




//login/logout part...
app.get('/login', async (req, res) => {
    res.render('login');
})

app.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await USER.findOne({ username, password });
        if (user !== null) {
            req.session.isLogedIn = true;
            req.session.userId = user._id;
            return res.redirect('/homepage');
        }
        res.send("you are not registered!");
    }
    catch (e) {
        console.log("Error login!!");
        next(e);
    }
})

app.get('/logout', async (req, res) => {
    req.session.userId = null;
    req.session.isLogedIn = null;
    res.redirect('/login');
})




//indiviual user...
app.get('/homepage', async (req, res, next) => {
    if (!req.session.isLogedIn) {
        return res.send("you are not loged in!");
    }

    try {
        const id = mongoose.Types.ObjectId(req.session.userId);
        const user = await USER.findOne(id);
        const tasks = user.work;
        res.render('homepage', { tasks });
    }
    catch (e) {
        console.log("Error Uploading tasks!!");
        next(e);
    }
})

app.post('/homepage', async (req, res, next) => {
    const { taskbar } = req.body;
    try {
        const task = new TODO({ todos: taskbar });
        await task.save();

        const user = await USER.findOne({ _id: mongoose.Types.ObjectId(req.session.userId) });
        user.work.push(task);
        await user.save();
        res.redirect('/homepage');
    }
    catch (e) {
        console.log("Error adding new task!!");
        next(e);
    }
})




//deletion part...
app.delete('/homepage', async (req, res, next) => {
    const { delbtn } = req.body;
    try {
        const result1 = await TODO.findOneAndDelete({ _id: mongoose.Types.ObjectId(delbtn) });
        let user = await USER.findById(mongoose.Types.ObjectId(req.session.userId));
        user.work = user.work.filter(function (obj) {
            if (obj._id.toString() !== mongoose.Types.ObjectId(delbtn).toString()) {
                return obj;
            }
        })
        await user.save();
        res.redirect('/homepage');
    }
    catch (e) {
        console.log("Error Deleting!!");
        next(e);
    }
})


//error handling...
app.use((err, req, res, next) => {
    const { message } = err;
    res.send(message);
})


const Port = process.env.PORT || 2000;
app.listen(Port, () => {
    console.log(`Server ${Port} running!`);
})
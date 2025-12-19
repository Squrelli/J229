const express = require('express');
const path = require('path');
const session = require('express-session');
const usersRouter = require('./routes/users');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(express.static(path.join(__dirname,'..','public')));
app.use('/',usersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/error', { error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('pages/error', { error: "Page not found" });
});

module.exports = app;
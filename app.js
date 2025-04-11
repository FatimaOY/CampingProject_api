const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routing
const indexRouter = require('./routes/index');
const campingspotsRouter = require('./routes/campingspots');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const passwordRouter = require('./routes/password');
const profileRouter = require('./routes/profile');
const usersRouter = require('./routes/users');
const amenitiesRouter = require('./routes/amenities');


app.use('/', indexRouter);
app.use('/campingspots', campingspotsRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/password', passwordRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);
app.use('/amenities', amenitiesRouter);




// -----------
//error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  

module.exports = app;
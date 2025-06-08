const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config(); //related to the env file

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Routing
const indexRouter = require('./routes/index');
const campingspotsRouter = require('./routes/campingspots');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const passwordRouter = require('./routes/password');
const profileRouter = require('./routes/profile');
const usersRouter = require('./routes/users');
const amenitiesRouter = require('./routes/amenities');
const bookingsRouter = require('./routes/bookings');
const uploadRoutes = require('./routes/upload');
const availabilityRouter = require('./routes/availability');
const imagesRouter = require('./routes/images');
const reviewsRouter = require('./routes/reviews');


app.use('/upload', uploadRoutes);
app.use('/bookings', bookingsRouter);
app.use('/', indexRouter);
app.use('/campingspots', campingspotsRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/password', passwordRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);
app.use('/amenities', amenitiesRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/availability', availabilityRouter);
app.use('/uploads', express.static('uploads'));
app.use('/images', imagesRouter);
app.use('/reviews', reviewsRouter);





// -----------
//error handeling for debugging
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    res.status(err.status || 500);
    res.status(err.status || 500).json({
      message: err.message,
      error: req.app.get('env') === 'development' ? err : {}
    });
    
  });
  

module.exports = app;
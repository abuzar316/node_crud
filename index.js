const ENV =  require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const session  = require('express-session');
const mainRouter = require('./routes/routes');
const { json } = require('express');

const app = express();
const PORT = process.env.PORT || 8000;
ENV.config();

// daba base connection
mongoose.connect('mongodb://localhost:27017/crud' , {useNewUrlParser:true, useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error',(error)=> console.log(error));
db.once('open',()=> console.log('connected to the database'));

// middeleware
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(session({
    secret:'my secret key',
    saveUninitialized:true,
    resave:false
}));
app.use((req,resp,next)=>{
    resp.locals.message;
    delete req.session.message;
    next();
})

app.use(express.static('uploads'))
// set template engine
app.set('view engine' , 'ejs');


// router prefix
app.use('',mainRouter);



app.listen(PORT , ()=> console.log(`Server start on PORT - ${PORT}`))
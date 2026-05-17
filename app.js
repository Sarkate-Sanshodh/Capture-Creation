require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require("path");
const adminRoute = require("./routes/adminRoute")
const eventRoute = require("./routes/eventRoute")
const authRoute = require("./routes/authRoute")
const { checkUser } = require('./middleware/authMiddleware');
const { title } = require("process");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.use(cookieParser()); // Cookies parse karne ke liye


// databse connection
const dbURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CaptureCreation";
mongoose.connect(dbURI)
    .then((result) => { console.log('mongoose are connected') })
    .catch(() => { console.log('mongoose are failed connected') });

app.use(checkUser);
app.get('/', function (req, res) {
    res.render('home', { title: 'home' });
})
app.use(authRoute);
app.use('/admin', adminRoute)
app.use('/event', eventRoute)

// app.use("/api/auth" , authRoute); 
// app.use("/api/event" , eventRoute); 
// app.use("/api/photo" , photoRoute); 


app.listen(3000, function () {
    console.log("it's running");

})
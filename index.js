const express = require('express')
const connectDB = require('./config/db')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const path = require('path')
dotenv.config()
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())  //express.json() middleware to parse JSON bodies
app.use(cookieParser())
app.use(express.static('public'));
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
connectDB()

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req,res)=>{
    res.send('Admin Homepage')
})

app.use('/admin', require('./routes/auth.routes'))   //signup&login routes
app.use('/admin/user', require('./routes/user.routes'))   //protected routes

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
const express = require('express')
const connectDB = require('./config/db')
const dotenv = require('dotenv')
dotenv.config()
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'));
connectDB()
const path = require('path')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req,res)=>{
    res.send('Admin Homepage')
})

app.use('/admin', require('./routes/auth.routes'))   //signup&login routes
// app.use('/admin/user', require('./routes/user.routes'))   //protected routes

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
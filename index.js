const express = require('express')
const connectDB = require('./config/db')
const dotenv = require('dotenv')
dotenv.config()
const app = express()
app.use(express.json())
connectDB()
const app = express()
const PORT = 3000

app.get('/', (req,res)=>{
    res.send('Admin Homepage')
})


app.use('/admin/user', require('./routes/auth.routes'))   //signup&login routes
// app.use('/admin/user', require('./routes/user.routes'))   //protected routes

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
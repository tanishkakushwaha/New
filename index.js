require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors({
    origin:true,
    credentials:true
}))
app.use(express.json())

const {userRouter}=require('./router/userRouter')
const {loginRouter}=require('./router/loginRouter')
const{verify,resendEmail,forgotPassword,resetPassword} = require('./controllers/controllers')
const{authenticateTokenMiddleware}=require('./middleware/middleware')

app.use('/',loginRouter)
app.use('/todo',userRouter)
app.get('/api/verify',verify);
app.post('/resend-email',authenticateTokenMiddleware,resendEmail);
app.post('/forgot-password',forgotPassword)
app.post('/reset-password',resetPassword)
const PORT = process.env.PORT||1000
app.listen(PORT,()=>{console.log(`server listening on http://localhost:${PORT}`)})

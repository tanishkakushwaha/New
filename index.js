require('dotenv').config
const express = require('express')
const app = express()
const {userRouter}=require('./router/userRouter')
const {loginRouter}=require('./router/loginRouter')
const{verify,resendEmail} = require('./controllers/controllers')
const{authenticateTokenMiddleware}=require('./middleware/middleware')
app.use(authenticateTokenMiddleware)
app.use(express.json())
app.use('/',loginRouter)
app.use('/todo',userRouter)
app.get('/verify',verify);
app.post('/resend-email', resendEmail);
const PORT = process.env.PORT||1000
app.listen(PORT,()=>{console.log(`server listening on http://localhost:${PORT}`)})

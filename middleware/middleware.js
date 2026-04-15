const jwt = require("jsonwebtoken")
function authenticateTokenMiddleware(req, res, next){
    console.log(req.path)
    if(req.path === "/signup" || req.path === "/login" || req.path === "/verify" || req.path === "/resend-email"){
        return next()
    }
    const authHeader = req.headers.authorization 
    if(!authHeader){
        return res.status(400).json({message:"Authorization header is missing"})
    }
    const token = authHeader.split(" ")[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded){
            return res.status(401).json({
                "message":"Invalid token"
            })
        }
        if(decoded.isVerified && req.path !=="/resend-email" && req.path !=="/verify" && req.path !=="/login" && req.path !=="/signup"){
            return res.status(400).json({message:"User not verified,verify your account to contiune"})
        }
        req.user = decoded
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            "message":"Invalid token"
        })
    }
    return next()
}




module.exports ={
    authenticateTokenMiddleware
}
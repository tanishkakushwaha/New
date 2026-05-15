const jwt = require("jsonwebtoken")
function authenticateTokenMiddleware(req, res, next){
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
        req.user = decoded
        if(!decoded.isVerified && req.path!=="/resend-email"){
            return res.status(400).json({message:"User not verified,verify your account to contiune"})
        }
            next()

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            "message":"Invalid token"
        })
    }
}




module.exports ={
    authenticateTokenMiddleware
}
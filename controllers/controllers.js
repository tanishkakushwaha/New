const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()
const crypto = require("crypto")
const{sendEmail} = require('../tools/sendEmail')

const signup = async(req, res)=>{
    try {
        const {email, password, name} = req.body
    if(!email || !password){
        return res.status(400).json({
            "message":"Email or password is missing"
        })
    }
    const existingUser = await prisma.user.findFirst({where:{email}})
    if(existingUser){
        return res.status(400).json({message:"User already exists"})
    }
    const hashedPassword = await bcrypt.hash(password,10)
    const createdUser = await prisma.user.create({
        data:{
            name: name,
            email: email,
            password: hashedPassword
        }
    })
    const token = crypto.randomBytes(32).toString("hex")
    await prisma.verificationToken.create({
        data:{
            userId: createdUser.id,
            token:token
        }
    })
    const subject ="verify Your Email-TodoApp"
    const text = `verify your email using the link:http://localhost:5173/verify?token=${token}`
    await sendEmail(createdUser.email,subject,text)
    return res.status(200).json({success:true,message:"User created successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            "error":error
        })
    }
}

const login = async(req, res)=>{
    try {
        const {email, password} = req.body  
    if(!email || !password){
        return res.status(400).json({message:"Email or password is missing"
        })
    }
    const user = await prisma.user.findUnique({
        where:{
            email: email
        }
    })
    if(!user){
        return res.status(404).json({message:"User not found"})
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    if(!isValidPassword){
        return res.status(401).json({message:"Invalid password"})
    }
    const objectForToken = {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified:user.isVerified
    }

    const token = jwt.sign(objectForToken, process.env.JWT_SECRET, {
        expiresIn: "48h"
    })
    return res.status(200).json({
        "success": true,
        "token": token
    })
    } catch (error) {
        console.log(error)
        res.status(500).json({  
            "error":error
        })
    }
}

const inviteUser = async(req,res)=>{
    try{
        const{email}=req.body
        const invitedUser = await prisma.user.findUnique({where:{email:email}
        })
        if(!invitedUser){
            return res.status(400).json({message:"User not found"})
        }
        const userIdOfInvitedUser = invitedUser.id
        const currentUser = await prisma.user.findUnique({where:{id:req.user.id}})
         if(currentUser.invitedUsers && currentUser.invitedUsers?.includes(userIdOfInvitedUser)){
            return res.status(400).json({message:"User already accesses"})
         }

        await prisma.user.update({where:{id:req.user.id},
        data:{invitedUsers:{push:userIdOfInvitedUser}}
    })
    return res.status(200).json({success:true,
        message:`Email${email} added successfully` 
    })
}
catch (error){
    console.log(error)
    res.status(500).json({message:"Internal server error"})
}
}

const verify = async(req,res)=>{
    try{
        const token = req.query.token
        const verificationToken = await prisma.verificationToken.findUnique({
            where:{token:token},
            select:{
                userId:true
            }
        })
        if(!verificationToken){
            return res.status(400).send("Invalid token")
        }
        await prisma.user.update({where:{id:verificationToken.userId},
        data:{
            isVerified:true
        }
        })
        return res.status(200).json({success:true,message:"User Verified Successfully"})
    }
catch(error){
    console.log(error)
    return res.status(400).send("Invaild Verification token")
}
}

const resendEmail = async(req,res)=>{
    try{
        if(!req.user){
            return res.status(400).json({message:"Unauthorized"})
        }
        const token = crypto.randomBytes(32).toString("hex")
        await prisma.verificationToken.create({
            data:{
                userId:req.user.id,
                token:token
            }
        })
        const subject = "verify Your Email-TodoApp"
        const text = `Verify your email using the link:http://localhost:5173/verify?token=${token}`

        await sendEmail(req.user.email,subject,text)

        return res.status(200).json({"status":"email sending successfull"})
    }

catch(error){
    console.log(error)
    res.status(500).json({error})
}
}

const getASingleTodo = async(req,res)=>{
    try{
        const todoId= parseInt(req.params.id)
        const ownerOfTodo = await prisma.todo.findUnique({
            where:{id:todoId},
            select:{userId:true}
        })
        if(!ownerOfTodo){
            return res.status(400).json({message:"Todo not found"})
        }
        const actualOwnerId = ownerOfTodo.userId
        const ownerDetails = await prisma.user.findUnique({
            where:{id:actualOwnerId},
            select:{invitedUsers:true}
        })

        let todo
        if(ownerDetails.invitedUsers?.includes(req.user.id)){
            todo = await prisma.todo.findUnique({where:{id:todoId}})
        }
        else{
            todo = await prisma.todo.findFirst({where:{id:todoId,userId:req.user.id}})
        }
        if(!todo){
            return res.status(400).json({message:"Todo not found"})
        }
        return res.status(200).json(todo)
    }
    catch(error){
        console.log(error)
        res.status(500).json({error})
    }
}
const createTodo = async (req,res)=>{
    try {
        let complete = false;
        const {title, completed} = req.body
        if(completed){
            complete = completed
        }
        if(!title){
            return res.status(400).json({message:"Title is missing"})
        }
        const createdTodo = await prisma.todo.create({
            data:{
                title: title,
                completed: complete,
                userId: req.user.id
            }

        })
        return res.status(200).json(createdTodo)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            "error": error
        })
    }
}

const getAllTodo = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where:{ invitedUsers: { has: req.user.id } },
            select:{ id:true }
        })
        const invitedIds = users.map(u=>u.id)
        const todos = await prisma.todo.findMany({
            where:{ OR:[ { userId: req.user.id }, { userId:{ in: invitedIds } } ] }
        })
        return res.status(200).json(todos)
    } catch (error) { return res.status(500).json({ error }) }
}
const updateTodo = async (req, res) => {

    try {
        const todoId = parseInt(req.params.id)
        const ownerOfTodo = await prisma.todo.findUnique({where:{id:todoId},select:{userId:true}})
        if(!ownerOfTodo){
            return res.status(400).json({message:"Todo not found"})
        }
        const detailsOfTheOwner = await prisma.user.findUnique({where:{id:ownerOfTodo.userId },select:{invitedUsers:true}})
        let todo
        if(detailsOfTheOwner.invitedUsers?.includes(req.user.id)){
            todo = await prisma.todo.findFirst({where:{id:todoId,userId:ownerOfTodo.userId}})
        } 
        else{
            todo = await prisma.todo.findFirst({where:{id:todoId,userId:req.user.id}})
        }
        if(!todo){
            return res.status(404).json({message:"Todo not found"})
        }
        const {title,completed} = req.body
        const updatedTodo = await prisma.todo.update({
            where:{id:todoId},
            data:{...(title && {title}),...(completed !== undefined &&{completed})}
        })
        return res.status(200).json(updatedTodo)
    } 
    catch (error) {
        console.log(error)
        res.status(500).json({"error": error})
    }
}


const deleteTodo = async(req, res)=>{
    try {
        const todoId = parseInt(req.params.id)
        const ownerOfTodo = await prisma.todo.findUnique({where:{id:todoId}, select:{userId:true}})
        const detailsOfTheOwner = await prisma.user.findUnique({where:{id:ownerOfTodo.userId },select:{invitedUsers:true}})

        let todo
        if(detailsOfTheOwner.invitedUsers?.includes(req.user.id)){
            todo = await prisma.todo.findFirst({where:{id:todoId,userId:ownerOfTodo.userId}})
        } 
        else{
            todo = await prisma.todo.findFirst({where:{id:todoId,userId:req.user.id}})
        }
        if(!todo) return res.status(404).json({message:"Todo not found"})

        const deletedTodo = await prisma.todo.delete({where:{id:todo.id}})
        return res.status(200).json({message:"Todo deleted successfully",todo:deletedTodo})
    } 
    catch (error){
        console.log(error)
        return res.status(500).json({error})
    }
}

const forgotPassword = async(req,res)=>{
    try{
        const{email}=req.body
        if(!email){
            return res.status(400).json({message:"Email is required"})
        }
        const user = await prisma.user.findUnique({where:{email}})
        if(!user){
            return res.status(400).json({message:"User not found"})
        }
        const resetToken = crypto.randomBytes(32).toString("hex")
        await prisma.user.update({where:{email},data:{resetToken,resetTokenExpiry:new Date( Date.now() + 15 * 60 * 1000)}})
        const resetLink=`http://localhost:5173/reset-password?token=${resetToken}`
        await sendEmail(email,"Reset your Password",`Click here to reset your password:${resetLink}`)
        return res.status(200).json({
            success:true,
            message:"Reset link sent to email"
        })
    }
    catch(error){
        console.error("Forgot password error:",error)
        return res.status(500).json({message: error.message})
    }
}


const resetPassword = async(req,res)=>{
    try{
        const token = req.body.token?.trim()
        const password = req.body.password?.trim()

        console.log("TOKEN RECEIVED:",token)
        console.log("CURRENT TIME:",new Date())
        if(!token||!password){
            return res.status(400).json({
                message:"Token and password missing"
            })
        }
        const user = await prisma.user.findFirst({where:{resetToken:token,resetTokenExpiry:{gt:new Date()}}})
        console.log("USER FOUND:",user)
        if(!user){
            return res.status(400).json({message:"Invalid or expired token"})
        }
        const hashedPassword = await bcrypt.hash(password,10)
        await prisma.user.update({
            where:{id:user.id},
            data:{
                password:hashedPassword,
                resetToken:null,
                resetTokenExpiry:null
            }
        })
        return res.status(200).json({
            success:true,
            message:"Password reset successful"
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            message:"Internal server erroe"
        })
    }
}

module.exports = {
    signup,
    login,
    inviteUser,
    createTodo,
    getAllTodo,
    getASingleTodo,
    updateTodo,
    deleteTodo,
    verify,
    resendEmail,
    forgotPassword,
    resetPassword
}

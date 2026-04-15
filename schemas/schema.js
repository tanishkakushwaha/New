const zod = require('zod')


const signupSchema = zod.object({
    name:zod.string().min(1,{message:"Name is required"}),
    email:zod.string().email({message:"Invalid email address"}),
    password:zod.string().min(6,{message:"Password must be at least 6 characters long"})
})


const loginSchema = zod.object({
    email:zod.string().email({message:"Invalid email address"}),
    password:zod.string().min(6,{message:"Password must be at least 6 characters long"})
})

const inviteSchema = zod.object({
    email:zod.string().email({message:"Invalid email address"})
})

module.exports ={
     signupSchema,  
        loginSchema,
        inviteSchema
}
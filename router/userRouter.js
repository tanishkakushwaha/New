const express = require('express')
const{authenticateTokenMiddleware}= require('../middleware/middleware')
const {createTodo,getASingleTodo, updateTodo, deleteTodo, getAllTodo, inviteUser } = require("../controllers/controllers")
const router = express.Router()
router.post('/invite',authenticateTokenMiddleware,inviteUser)

router.post('/create',authenticateTokenMiddleware,createTodo)
router.get('/',authenticateTokenMiddleware,getAllTodo)
router.get('/:id',authenticateTokenMiddleware ,getASingleTodo)
router.put('/:id',authenticateTokenMiddleware,updateTodo)
router.delete('/:id',authenticateTokenMiddleware,deleteTodo)
   

module.exports={
    userRouter:router
}
const express = require('express')
const {createTodo,getASingleTodo, updateTodo, deleteTodo, getAllTodo, inviteUser } = require("../controllers/controllers")
const router = express.Router()
router.post('/invite',inviteUser)

router.post('/create',createTodo)
router.get('/',getAllTodo)
router.get('/:id' ,getASingleTodo)
router.put('/:id',updateTodo)
router.delete('/:id',deleteTodo)
   

module.exports={
    userRouter:router
}
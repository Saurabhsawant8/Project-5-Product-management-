const express = require("express");
const router = express.Router();
const {createUser,userLogin,getUser,userUpdate}=require("../controller/userController")
const {createProduct, getProduct, getProductByQuery, updateProduct, deletProduct}= require('../controller/productController')
const {authenticate,authorize}=require('../middileWare/auth');


const { createCart, updateCart,getCart,deleteCart} = require("../controller/cartController");

const {createOrder, updateOrder}= require('../controller/orderController')



router.get('/test-me', function(req,res){
    res.send({msg: "done"})
})

//**User**
router.post('/register',createUser)
router.post('/login',userLogin)
router.get("/user/:userId/profile",authenticate,getUser)
router.put("/user/:userId/profile",authenticate ,authorize, userUpdate)


//**Product**
router.post('/products',createProduct)
router.get('/products',getProductByQuery)
router.get('/products/:productId',getProduct)
router.put('/products/:productId',updateProduct)
router.delete('/products/:productId',deletProduct)

//**Cart*/
router.post('/users/:userId/cart',authenticate,authorize,createCart)
router.put('/users/:userId/cart',authenticate,authorize,updateCart)
router.get('/users/:userId/cart',authenticate,getCart)
router.delete('/users/:userId/cart',authenticate,deleteCart)

//**order*/
router.post('/users/:userId/orders',authenticate,authorize,createOrder)

router.put('/users/:userId/orders',authenticate,authorize,updateOrder)



module.exports = router
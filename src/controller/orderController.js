const cartModel = require('../model/cartModel')
const userModel = require('../model/userModel')
const orderModel = require('../model/orderModel')
const {isValidObjectId,isValidRequestBody}=require('../util/validator')


exports.createOrder = async function (req, res) {
    try {
      const userId = req.params.userId
      
      const { cartId, status, cancellable } = req.body
      
       if(!isValidRequestBody(req.body)) return res.status(400).send({ status: false, message: "Please provid body !!!" });
      
      if(!cartId) return res.status(400).send({ status: false, message: "Please provide cartId !!!" });
    
      if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please provide valid cartId!" });
  
      
      const cartItems = await cartModel.findOne({ _id: cartId, userId: userId})
     
      if (cartItems.userId != userId) return res.status(404).send({ status: false, message: `${userId} is not present in the DB!` });
     
      if (!cartItems) return res.status(400).send({ status: false, message: "Either cart is empty or does not exist!" });
  
      
      let items = cartItems.items
      let totalQuantity = 0
      for (let i = 0; i < items.length; i++) {
        totalQuantity += items[i].quantity
      }

      if(items==0) return  res.status(400).send({ status: false, message: "there is no items left for Order !!!" });

      
      if (cancellable) {
        
        if (cancellable !== true || false) {
          return res.status(400).send({ status: false, message: "Cancellable can be either true or false!" });
        }
      }
  
      if (status) {
        
        if (status !== "pending" || "completed" || "cancled") {
          return res.status(400).send({ status: false, message: "Status can be either pending or completed or cancled!" });
        }
      }

      let order = { userId: userId, items: cartItems.items, totalPrice: cartItems.totalPrice, totalItems: cartItems.totalItems, totalQuantity: totalQuantity, cancellable: cancellable, status: status }
  
      let orderCreation = await orderModel.create(order)
      
      await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } })
      
      return res.status(201).send({ status: true, message: `Success`, data: orderCreation });
    }
    catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  }

  
  exports.updateOrder = async function (req, res){
    try {

        let data = req.body
        let userId = req.params.userId

        
        let{ orderId, status} = data

        if(!isValidRequestBody(data)) return res.status(400).send({ status: false, message: "Please provid body !!!" });

        if(!orderId){
          return res.status(400).send({ status : false, message : "OrderId is missing"})
       }  

        if(!isValidObjectId(userId)){
            return res.status(400).send({ status : false, message : "UserId is not valid"})
        }
         
        if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "Please provide valid orderId!" });
         
         let checkStatus = await orderModel.findById(orderId)
         if(checkStatus.cancellable==false) return res.status(400).send({status:false,message:"This order can't be cancellable"})

        let newStatus = {}
        if(status){
            if(!(status =="completed" || status == "canceled")){
                return res.status(400).send({ status : false, message : "status can be from enum only like [completed , canceled ]"})
            }
            else{
              newStatus.status=status
            }
        }
        else{
          return res.status(400).send({status:false,message:" Please take status in req body for update the product !!!"})
        }
           
      
        const orderCancel = await orderModel.findOneAndUpdate({ _id: orderId },{$set:newStatus},{ new: true });
        return res.status(200).send({ status: true, message: "Success", data: orderCancel });
    }catch(err){
       return res.status(500).send({message:err.message})
    }
}
 
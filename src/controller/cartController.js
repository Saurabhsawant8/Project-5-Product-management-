const cartModel = require('../model/cartModel')
const productModel = require('../model/productModel')
const userModel=require('../model/userModel')

const {isValidEmail,isValidObjectId,isValidphone,isValidBody,isValidRequestBody,isValidName,isValidpassword,isValidCity,isValidPinCode,isValidProductName,isValidPrice,isValidateSize,isValidNo,isValidImage}=require('../util/validator')
// ------create-cart------
exports.createCart = async function (req, res) {
  try {
      let body = req.body
      let userId = req.params.userId

      let productId = body.productId
      let productQuantity = body.quantity

      // body validation
      if (!isValidBody(body)) return res.status(400).send({ status: false, message: "Body cannot be empty" })

      // object id validation
      if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Bad Request. userId invalid" })
      if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Bad Request. productId invalid" })

      //items validation
  
      if ("quantity" in body){
          if (!productQuantity) return res.status(400).send({ status: false, message: "product Quantity should be given" })
      }else{
          productQuantity = 1
      }

      // validating product existance
      let productSearch = await productModel.findOne({ _id: productId, isDeleted: false })
      if (!productSearch) return res.status(400).send({ status: false, message: "product with this id is not available. please enter a valid product id" })


      let productPrice = productSearch.price

      
      let items = [{ productId: productId, quantity: productQuantity }]
      
      let cartSearch = await cartModel.findOne({ userId : userId})
      if(cartSearch){
        
          let priceToAdd = productSearch.price * productQuantity
                      
          let updateCart = await cartModel.findOneAndUpdate({ userId: userId, "items.productId": productId }, { $inc: { "items.$.quantity": productQuantity, totalPrice: priceToAdd } }, { new: true }).select({ __v: 0, "items._id": 0 })  
   
          if(updateCart == null){
              updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { $addToSet: { items: items }, $inc: { totalPrice: priceToAdd, totalItems: 1 } }, { new: true }).select({ __v: 0, "items._id": 0 })     
          }
          return res.send({ status: true, message: "Cart created successfully", data: updateCart })

      }else{
          let totalPrice = productPrice
          let totalItems = 1
          let newProductData = { userId, items, totalPrice, totalItems }
     
          let cartData = await cartModel.create(newProductData)
        
          let respondData = { _id: cartData._id, userId: cartData.userId, items: [{ productId: productSearch, quantity: cartData.items[0].quantity }], totalPrice: cartData.totalPrice, totalItems: cartData.totalItems, createdAt: cartData.createdAt, updatedAt: cartData.updatedAt }
          return res.status(201).send({ status: true, message: "Cart created successfully", data: respondData })
      }
  } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server side Errors. Please try again later", error: error.message })
  }
}


// -------update-cart------

exports.updateCart = async function (req, res) {
  try {
     let body = req.body;
     let userId = req.params.userId

     let { cartId, productId, removeProduct } = body
    
     if (!isValidBody(body)) return res.status(400).send({ status: false, message: "Body should not be empty" })
     let findUser = await userModel.findById({ _id: userId })
     if (!findUser) return res.status(400).send({ status: false, message: "User not found" })
     
     if (!cartId) return res.status(400).send({ status: false, message: "please enter your cartId" })
     if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "card Id is invalid" })
     const findCart = await cartModel.findOne({ _id: cartId })
     if (!findCart) return res.status(400).send({ status: false, message: "Cart id not exist" })

     if (!productId) return res.status(400).send({ status: false, message: "please enter your productId" })
     if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "product Id is invalid" })
     const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
     if (!findProduct) return res.status(400).send({ status: false, message: "product does not not exist" })

     if (!isValidBody(removeProduct)) return res.status(400).send({ status: false, message: "please enter your removeProduct" })

     if (![0, 1].includes(removeProduct)) return res.status(400).send({ status: false, message: "Remove product should be only in 0 or 1 " })

     for (let i = 0; i < findCart.items.length; i++) {
 
         if (findProduct._id.toString() == findCart.items[i].productId.toString()) {
             if (removeProduct == 1 && findCart.items[i].quantity > 1) {
                 let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, "items.productId": productId }, { $inc: { "items.$.quantity": -1, totalPrice: -(findProduct.price) } }, { new: true }).select({ __v: 0, "items._id": 0 })
                 return res.status(200).send({ status: true, message: "cart updated successfully", data: updateCart })
             } else {
                 let updateCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -(findProduct.price * (findCart.items[i].quantity)) } }, { new: true }).select({ __v: 0, "items._id": 0 })
                 return res.status(200).send({ status: true, message: "removed successfully", data: updateCart })
              }
         }
     } return res.status(404).send({ status: false, message: "product not found" })

 } catch (err) {
     return res.status(500).send({ status: false, message: "There is an error inside of the code" })
 }
}


// ------get-cart------
exports.getCart = async function (req, res) {
  try {

      let userId = req.params.userId
      if ((!ObjectId.isValid(userId))) {
          return res.status(400).send({ status: false, message: "Bad Request. userId  is invalid" })
      }

      let cart = await cartModel.findOne({ userId: userId }).select({ __v: 0, "items._id": 0 }).populate([{ path: "items.productId" }])
      if (!cart) return res.status(404).send({ status: false, message: "No such cart Exits" })

    
      return res.status(200).send({ status: true, message: "Success", data: cart })
  }
  catch (error) {
      res.status(500).send({ message: "Error", error: error.message })
  }
}

  
// ------delete-cart------
exports.deleteCart= async function(req,res){
  try{
      const userId=req.params.userId;
     
      if (!isValidObjectId(userId)) return res.status(400).send({status : false , message : "invalid userId"})
      
     if (req.decode.userId!=userId) return res.status(403).send({status : false , message : "you are not authorised"})

      const updateData = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalItems: 0, totalPrice: 0 }}, { new: true })

      if(!updateData) return res.status(404).send({status:false, message:"user not exist"})

      return res.status(204).send()
  }
catch(err){     
          return res.status(500).send({status:false,message:err.message})
 }

}



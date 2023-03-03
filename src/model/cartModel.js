const mongoose = require('mongoose')
const ObjectId =  mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
userId :{type:ObjectId,ref:"USER",require:true},
items :[{productId:{type:ObjectId,ref:"Product",require:true},
        quantity:{type:Number,require:true,min:1}
}],
totalPrice : {type:Number,require:true,},
totalItems : {type:Number,require:true,}
},{timestamps:true})

module.exports= mongoose.model("Cart",cartSchema) 


const jwt = require('jsonwebtoken');
const cartModel = require('../model/cartModel');
const {isValidObjectId}= require('../util/validator')

const userModel= require("../model/userModel");


//________________________________________Authentication_______________________________________________________________

exports.authenticate = (req, res, next) => {
    try{
          let token = req.headers["authorization"];
          token = token.slice(7)

          if (!token) return res.status(400).send({ status: false, msg: "token must be present" });

          jwt.verify(token, "Group-13", function (err, decode) {
          if (err) { return res.status(401).send({ status: false, data: "Token is not Valid !!!" }) }
          req.decode = decode;
          return  next();

      })

    }
          catch (error) {
          res.status(500).send({ staus: false, msg: error.message });
    }
}

//______________________________________________Authorization______________________________________________________________

exports.authorize= async function ( req, res, next) {
    try{
          let userId= req.params.userId
          if(!isValidObjectId(userId)) return res.status(400).send({status:false,message:"Inavlid userId"})

          let gettingUserId= await userModel.findById({_id: userId})
          if(!gettingUserId) return res.status(404).send({status:false,message:"this userId is not found"})

          if ( userId !=req.decode.userId)  return res.status(403).send({ status: false, message: "you are not Athorised" });

          return next()
    }catch(error){
          return res.status(500).send({msg: error.message})
     }
  }



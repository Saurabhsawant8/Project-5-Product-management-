const userModel = require("../model/userModel")
const { isValidEmail, isValidpassword } = require("./validator")

const login=async function(req,res){
    try{

let body=req.body
let {email,password}=body
if(!email) return res.status(400).send({status:false })
if(!isValidEmail(email)) return res.status(400).send()
if(!password) return res.status(400).send()
if(!isValidpassword(password)) return res.status(400).send()

let emailIs=await userModel.findOne({email:email})
if(!emailIs) return res.status(404).send("not reg.")

let checkpassward=await bcrypt.compare(password,emailIs.password)
if(!checkpassward) return res.status(400).send("incorrect password")

let token=jwt.sign({userId:emailIs._id},"saurabh")
let obj={
    userId:emailIs._id,
    token:token
}
return res.status(200).send({status:true,message : "login successfull",data:obj})

    }catch(err){
        return res.status(500).json({status:false , message: err.message})
}
}
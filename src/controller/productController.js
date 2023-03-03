const productModel = require('../model/productModel')
const aws = require('../aws/S3')

const validator = require('../util/validator')
//const { isValidObjectId } = require('mongoose')
const { isValidEmail, isValidObjectId, isValidphone, isValidBody, isValidRequestBody, isValidName, isValidPrice, isValidateSize, isValidNo } = require('../util/validator')

// -------create-product-------
exports.createProduct = async function (req, res) {
  try{  let body = req.body
    if (!isValidRequestBody(req.body)) return res.status(400).json({ status: false, message: "requesbody must be present" })
    const { title, description, price, availableSizes, installments } = body
    // ------title validation-----
    if (!title) return res.status(400).json({ status: false, message: "title must be present" })
    if (!isValidName(title)) return res.status(400).json({ status: false, message: "please only use a-z & A-Z alphabates in title" })
    const checktitle = await productModel.findOne({ title })
    if (checktitle) return res.status(400).json({ status: false, message: "title is already present" })

    if (!description) return res.status(400).json({ status: false, message: "description must be present" })
    if (!isValidName(description)) return res.status(400).json({ status: false, message: "please only use a-z & A-Z alphabates" })

    if (!price) return res.status(400).json({ status: false, message: "price must be present" })
    if (!isValidNo(price)) return res.status(400).json({ status: false, message: "please use only numbers(0-9)" })

    if (!availableSizes) return res.status(400).json({ status: false, message: "availablesizes must be present" })
    if (!isValidateSize(availableSizes)) return res.status(400).json({ status: false, message: "only use[S, XS, M, X, L, XXL, XL]" })

    if (installments) {
        if (!isValidNo(installments)) return res.status(400).json({ status: false, message: "in installment use only numbers" })
    }


    // ------create aws-s3 link-----
    let files = req.files

    if (files && files.length > 0) {
        body.productImage = await aws.uploadFile(files[0])
    }
    else {
        res.status(400).send({ message: "productimage must be present" })
    }
    let createProduct = await productModel.create(body)
    return res.status(201).send({ status: true, message: "Success", data: createProduct })
    
}catch(err){
    return res.status(500).send({status:false,message:err.message})
}
}

// get product by querys(filter)
exports.getProductByQuery = async function (req, res) {

    try {
        let data = req.query
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = data

        let obj = { isDeleted: false }

        if (size) {
            if (!isValidBody(size)) return res.status(400).send({ status: false, message: "Please enter Size" });
            if(!isValidateSize(size))return res.status(400).send({ status: false, message: "only use[S, XS, M, X, L, XXL, XL]" })
            obj.availableSizes = size
        }

        if (name) {
            if (!isValidBody(name)) { return res.status(400).send({ status: false, message: "Please enter name" }) }
            if (!isValidName(name)) { return res.status(400).send({ status: false, message: "Please mention valid name" }) }
            obj.title = name
        }

        if (priceGreaterThan) {
            if (!isValidBody(priceGreaterThan)) return res.status(400).send({ status: false, message: "Please enter Price Greater Than" });
            if (!isValidPrice(priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan must be number" });
            obj.price = { $gt: priceGreaterThan }
        }

        if (priceLessThan) {
            if (!isValidBody(priceLessThan)) return res.status(400).send({ status: false, message: "Please enter Price Lesser Than" });
            if (!isValidPrice(priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan must be number" });
            obj.price = { $lt: priceLessThan }
        }

        if (priceGreaterThan && priceLessThan) {
            obj.price = { $gt: priceGreaterThan, $lt: priceLessThan }
        }

        if (priceSort) {
            if (!(priceSort == -1 || priceSort == 1)) return res.status(400).send({ status: false, message: "Please Enter '1' for Sort in Ascending Order or '-1' for Sort in Descending Order" });
        }

        let getProduct = await productModel.find(obj).sort({ price: priceSort })

        if (getProduct.length == 0) return res.status(404).send({ status: false, message: "Product Not Found." })

        return res.status(200).send({ status: true, message: "Success", data: getProduct })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//----- get product by product id (params)-----

exports.getProduct = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "please provide valid product id" })

        const productData = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productData) return res.status(404).send({ status: false, message: "product does not exist in db" })

        return res.status(200).send({ status: true, message: "Success", data: productData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


exports.updateProduct = async function (req, res) {
    try {
        const body = req.body
        let productId = req.params.productId
        let files = req.files
        let { title, description, price, isFreeShipping, style, availableSizes, installments, } = body
        if (!isValidRequestBody(body)) return res.status(400).send({ status: false, message: "Please enter atleast one update" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please enter valid productId in params" })
        if (title) {
            if (!isValidName(title)) return res.status(400).send({ status: false, message: "in title use only alphabates" })
            let checkTitle = await productModel.findOne({ title: title })
            if (checkTitle) return res.status(400).send({ status: false, message: "title is already present" })
            body.title = title
        }
        if (files.length > 0) {
            body.productImage = await aws.uploadFile(files[0])
        }
        if (description) {
            if (!isValidName(description)) return res.status(400).send({ status: false, message: "in description use only alphabates" })
            body.description = description
        }
        if (price) {
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "in price use only numbers" })
            body.price = price
        }
        if (isFreeShipping) {
            body.isFreeShipping = isFreeShipping
        }
        if (style) {
            if (!isValidName(style)) return res.status(400).send({ status: false, message: "in style use only alphabates" })
            body.style = style
        }
        if (availableSizes) {
            if (!isValidateSize(availableSizes)) return res.status(400).json({ status: false, message: "only use[S, XS, M, X, L, XXL, XL]" })
            body.availableSizes = availableSizes
        }
        if (installments) {
            if (!isValidNo(installments)) return res.status(400).json({ status: false, message: "in installment use only numbers" })
            body.installments = installments
        }

        let productUpdate = await productModel.findOneAndUpdate({ isDeleted: false, _id: productId }, { $set: body }, { new: true })
        if (!productUpdate) return res.status(404).send({ status: false, message: "product not found" })
        return res.status(200).send(({ status: true, message: "Success", data: productUpdate }))
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

exports.deletProduct = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "please provide valid product id" })

        const deletedProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

        if (!deletedProduct) return res.status(404).send({ status: false, message: "Product is not found or Already Deleted" })

        return res.status(200).send({ status: true, message: "product successfully deleted" })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



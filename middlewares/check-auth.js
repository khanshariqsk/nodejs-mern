const jwt = require('jsonwebtoken')
const HttpError = require('../models/http-error')

const checkAuth = (req,res,next)=>{
    if(req.method === 'OPTIONS'){
        return next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1] // 'Bearer token'....it will contain this
        if(!token){
            throw new Error('Authentication Failed!!')
        }
        const verifiedUser = jwt.verify(token,process.env.JWT_PRIVATEKEY)
        req.userData = {userId:verifiedUser.userId}
        next()
    } catch (error) {
        return next(new HttpError('Authentication Failed!!',403))
    }
   
}

module.exports = checkAuth;
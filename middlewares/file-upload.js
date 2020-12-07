const multer = require('multer')
const uuid = require('uuid/v1')
const MIME_TYPE = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
}
const fileUpload = multer({
    limits:500000,
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,'uploads/images')
        },
        filename:(req,file,cb)=>{
            const ext = MIME_TYPE[file.mimetype]
            cb(null,uuid()+'.'+ext)
        }
    }),
    fileFilter:(req,file,cb)=>{
        const isValid = !!MIME_TYPE[file.mimetype]
        if(isValid){
            cb(null,true)
        }
        else{
            cb(new Error('Invalid mime type!!'),false)
        }
    }
})
module.exports = fileUpload
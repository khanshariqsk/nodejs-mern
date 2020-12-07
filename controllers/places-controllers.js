
const { validationResult } = require('express-validator');
const Places = require('../models/place-model')
const HttpError = require('../models/http-error');
const User = require('../models/user-model');
const mongoose = require('mongoose');
const fs = require('fs')



const getPlaceById = async (req, res, next) => {
const placeId = req.params.pid; 
try {

const place = await Places.findById(placeId)
if(!place){
  return next(new HttpError('Could not find the place with the given ID',500))
}
res.status(200).json({place})

} catch (error) {
  return next(new HttpError('Could not find the place with the given ID',404))
}
 
};


const getPlacesByUserId = async (req, res, next) => {
const userId = req.params.uid;
// try {

//   const places = await Places.find({creator:userId})
//   if(places.length===0){
//     return next(new HttpError('No places Found!!',404))
//   }
//   res.status(200).json(places)
  
//   } catch (error) {
//     return next(new HttpError('Could not find the places with the given User ID',404))
//   }
 let userWithId ;
 try {
   userWithId = await User.findById(userId).populate('places')
 } catch (error) {
   return next(new HttpError('Could not find the places with the given ID',404))
 }
 if(!userWithId){
   return next(new HttpError('Could not find the places with the given ID',404))
 }
 res.status(200).json({places:userWithId.places})
};


const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422))
  }

  const { title, description, address } = req.body;
  
  const createdPlace = new Places ({
    title,
    description,
    imageUrl:req.file.path,
    address,
    creator:req.userData.userId
  
  });
let user;
 try {
   user = await User.findById(req.userData.userId)
 } catch (error) {
   return next(new HttpError('Something Went Wrong!!',500))
 }

if(!user){
  return next(new HttpError('Could not find the user with the given ID',404))
}

let result;
  try {
  const sess = await mongoose.startSession()
  sess.startTransaction()
  console.log(createdPlace)
  result = await createdPlace.save({session:sess})
  user.places.push(result)
  await user.save({session:sess})
  await sess.commitTransaction()
  
  } catch (error) {
    return next(new HttpError("ERROR !! Could not be able to create place",500))
  }

  res.status(201).json({ place: result });
  
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;
  try {
    place = await Places.findOne({_id:placeId})
  } catch (error) {
    return next(new HttpError('Could not find the place with the given ID',404))
  }
  if(req.userData.userId.toString() !== place.creator.toString()){
    return next(new HttpError("You are not Allowed to update the Place!!",401))
  }

  try {
    await Places.updateOne({_id:placeId},{$set:{
      title,
      description
    }})
  } catch (error) {
    return next(new HttpError("Could not be able to update place",500))
  }
  res.status(202).json({message:"Updated Successfully!!"})
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
     place = await Places.findById(placeId).populate('creator')
  } catch (error) {
    return next(new HttpError('Could not find the place with the given ID',404))
  }
 
  if(req.userData.userId.toString() !== place.creator._id.toString()){
    return next(new HttpError("You are not Allowed to Delete the Place!!",401))
  }
  const placePath = place.imageUrl
  try {
  const sess = await mongoose.startSession()
  sess.startTransaction()
  await place.remove({session:sess})

 place.creator.places.pull(place)
 await place.creator.save({session:sess})
 await sess.commitTransaction()

 } catch (error) {
  return next(new HttpError("Deleting Place Failed!!",500)) 
 }
 fs.unlink(placePath,err=>{
 })
 res.status(200).json({ message: 'Deleted place Successfully!!.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

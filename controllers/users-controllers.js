
const { validationResult } = require('express-validator');
const User = require("../models/user-model")
const bcrypt = require('bcryptjs')
const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken')

const getUsers = async (req, res, next) => {
  let AllUsers;
  try {
     AllUsers = await  User.find({},'-password')
  } catch (error) {
    return next(new HttpError('Could not retrieve the Users!!',500))
  }
  res.json({ users: AllUsers });
};

const signup = async (req, res, next) => {
  
  const errors = validationResult(req);
  let duplicateEmail;

  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { name, email, password} = req.body;

 try {
   duplicateEmail = await User.find({email:email})  
 } catch (error) {
  return next(new HttpError("Something Went Wrong",500))
 }

  if(duplicateEmail.length>0){
    return next (new HttpError('Email Already Exists!!Try Different One',400))
  }
let hashPassword;
  try {
     hashPassword = await bcrypt.hash(password,12)
  } catch (error) {
    return next(new HttpError('Could not create user,Please try again!',500))
  }
let addedUser;
  try {
    const createdUser = new User ({
      name,
      email,
      password:hashPassword,
      imageUrl:req.file.path,
      places:[]
    });
   addedUser = await createdUser.save()
  } catch (error) {
    return next(new HttpError("User Creation Failed!!",500))
  }
  let token;
  try {
    token = jwt.sign({userId:addedUser._id,email:addedUser.email,},process.env.JWT_PRIVATEKEY,{expiresIn:'1h'})
  } catch (error) {
    return next(new HttpError('Sorry!! Could not signin.try again',500))
  }
  res.status(201).json({userId:addedUser._id,email:addedUser.email,token:token})
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({email:email})
  if(!existingUser){
    return next(new HttpError('You are not signedIn! Please SignUp to login',403))
  }
  const hasPassword = await bcrypt.compare(password,existingUser.password)

  if(!hasPassword){
    return next(new HttpError("Entered Password is wrong!!",403))
  }
  let token;
  try {
    token = jwt.sign({userId:existingUser._id,email:existingUser.email,},process.env.JWT_PRIVATEKEY,{expiresIn:'1h'})
  } catch (error) {
    return next(new HttpError('Sorry!! Could not Logging in , please try again',500))
  }
  res.status(200).json({message:"You are Logged In",userId:existingUser._id,email:existingUser.email,token:token})
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

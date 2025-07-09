const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ENV = require('../config/env');

const UsersModel = require('../models/users.model');

const register = async (req, res) => {
    try {
        const passwordHashed = await bcrypt.hash(req.body.password, 10);

        const user = await UsersModel.create({
            ...req.body,
            password: passwordHashed
        })

            res.status(201).json({
            message:"User created",
            user
        })       
    } catch (error) {
        console.log(error.message);        
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await UsersModel.find();
        res.status(200).json(users);
    } catch (error) {
        console.log(error.message);        
    }
}

const getUserByID = async (req, res) => {
    try {
        const users = await UsersModel.findByID(req.params.id);
        res.status(200).json(users);
    } catch (error) {
        console.log(error.message);
    }
}

const sign = async (req, res) => {
    try {
        const user = await UsersModel.findOne({email: req.body.email});

        if(!user) return res.status(404).json("User not found !")

        const comparePassword = await bcrypt.compare(
            req.body.password,
            user.password
        )

        if(!comparePassword) return res.status(400).json("Wrong Credentials !!!")

        const token = jwt.sign(
            { id: user._id },
            ENV.TOKEN_SIGNATURE,
            { expiresIn: "24" }
        )

        const { password, ...others } = user._doc

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(200).json(others);

    } catch (error) {
        console.log(error.message);        
    }
}

module.exports = {
    register,
    getAllUsers,
    getUserByID,
    sign
}
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';
import validator from 'validator';
import axios from 'axios';

export const registerUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;
    
    try {
        // Validation
        if (!name || !email || !password || name === "" || email === "" || password === "") {
            return next(errorHandler(400, "All fields are required"));
        }

        if (!validator.isEmail(email)) {
            return next(errorHandler(400, "Invalid email format"));
        }

        if (password.length < 8) {
            return next(errorHandler(400, "Password must be at least 8 characters"));
        }

        if (name.length < 3 || name.length > 50) {
            return next(errorHandler(400, "Name must be between 3-50 characters"));
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(errorHandler(409, "Email already exists"));
        }

        // Hash password
        const hashPass = bcryptjs.hashSync(password, 12);
        
        // Create new user
        const newUser = new User({
            name: validator.escape(name.trim()),
            email: validator.normalizeEmail(email.trim()),
            password: hashPass,
            role: role || 'user'
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Omit password from response
        const { password: _, ...userWithoutPassword } = newUser._doc;

        res.status(201)
           .cookie('access_token', token, {
               httpOnly: true,
               sameSite: 'strict',
               maxAge: 24 * 60 * 60 * 1000 // 1 day
           })
           .json(userWithoutPassword);

    } catch (error) {
        if (error.code === 11000) {
            next(errorHandler(409, "Email already exists"));
        } else {
            next(error);
        }
    }
};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Validate inputs
        if (!email || !password || email === "" || password === "") {
            return next(errorHandler(400, "Email and password are required"));
        }

    

        // Check if user exists
        const user = await User.findOne({ email }).select('+password +loginAttempts +accountLockedUntil');
        
        if (!user) {
            return next(errorHandler(401, "Invalid credentials"));
        }

        // Check if account is locked
        if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
            const remainingTime = Math.ceil((user.accountLockedUntil - Date.now()) / (60 * 1000));
            return next(errorHandler(403, `Account temporarily locked. Try again in ${remainingTime} minutes`));
        }

        // Check password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            // Increment failed login attempts
            user.loginAttempts += 1;
            
            // Lock account after 5 failed attempts
            if (user.loginAttempts >= 5) {
                user.accountLockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
            }
            
            await user.save();
            return next(errorHandler(401, "Invalid credentials"));
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.accountLockedUntil = null;
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Omit sensitive fields from response
        const { password: _, loginAttempts, accountLockedUntil, ...userWithoutSensitiveData } = user._doc;

        res.status(200)
           .cookie('access_token', token, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict',
               maxAge: 24 * 60 * 60 * 1000 // 1 day
           })
           .json(userWithoutSensitiveData);

    } catch (error) {
        next(errorHandler(500, "Server error"));
    }
};

export const logout = (req, res, next) => {
    try {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        next(errorHandler(500, "Logout failed"));
    }
};

export const getUser = async (req, res, next) => {
    try {
        // 1. Validate the user ID from request params
        if (!validator.isMongoId(req.params.id)) {
            return next(errorHandler(400, "Invalid user ID format"));
        }

        // 2. Find the user by ID
        const user = await User.findById(req.params.id)
            .select('-password -__v -loginAttempts -accountLockedUntil');

        // 3. Check if user exists
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        // 4. Authorization check (optional - ensure users can only access their own data unless admin)
        if (req.user.id !== user.id && req.user.role !== 'admin') {
            return next(errorHandler(403, "Unauthorized to access this user's data"));
        }

        // 5. Return the user data
        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(errorHandler(500, "Failed to retrieve user information"));
    }
};

export const getuser = async (req, res, next) => {
    try {
        // 1. Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 2. Get registers with pagination
        const user = await User.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // 3. Get total count for pagination info
        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            count: user.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: user
        });

    } catch (error) {
        next(error);
    }
}
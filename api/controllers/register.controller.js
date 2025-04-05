import Register from "../models/register.model.js";
import { errorHandler } from "../utils/error.js";
import validator from "validator";
import xss from "xss";

export const register = async (req, res, next) => {
    const { name, email, subject, message } = req.body;
    
    try {
        // 1. Validate required fields
        if (!name || !email || !subject || !message) {
            return next(errorHandler(400, "All fields are required"));
        }

        // 2. Sanitize inputs
        const sanitizedData = {
            name: xss(name.trim()),
            email: xss(email.trim()),
            subject: xss(subject.trim()),
            message: xss(message.trim())
        };

        // 3. Validate email format
        if (!validator.isEmail(sanitizedData.email)) {
            return next(errorHandler(400, "Invalid email format"));
        }

        // 4. Validate field lengths
        if (sanitizedData.name.length > 50) {
            return next(errorHandler(400, "Name cannot exceed 50 characters"));
        }

        if (sanitizedData.subject.length > 100) {
            return next(errorHandler(400, "Subject cannot exceed 100 characters"));
        }

        if (sanitizedData.message.length > 1000) {
            return next(errorHandler(400, "Message cannot exceed 1000 characters"));
        }

        // 5. Check for existing registration (optional)
       

        // 6. Create and save new registration
        const newRegister = new Register(sanitizedData);
        await newRegister.save();

        // 7. Send success response
        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                id: newRegister._id,
                name: newRegister.name,
                email: newRegister.email
            }
        });

    } catch (error) {
        // 8. Handle specific database errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(errorHandler(400, messages.join(', ')));
        }
        
        // 9. Handle duplicate key errors
        if (error.code === 11000) {
            return next(errorHandler(400, "Duplicate field value entered"));
        }

        // 10. Pass other errors to error handler
        next(error);
    }
};

export const getRegisters = async (req, res, next) => {
    try {
        // 1. Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 2. Get registers with pagination
        const registers = await Register.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // 3. Get total count for pagination info
        const total = await Register.countDocuments();

        res.status(200).json({
            success: true,
            count: registers.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: registers
        });

    } catch (error) {
        next(error);
    }
};

export const deleteRegister = async (req, res, next) => {
    try {
        // 1. Validate ID format
        if (!validator.isMongoId(req.params.registerId)) {
            return next(errorHandler(400, "Invalid register ID"));
        }

        // 2. Find and delete register
        const register = await Register.findByIdAndDelete(req.params.registerId);
        
        if (!register) {
            return next(errorHandler(404, "Register not found"));
        }

        res.status(200).json({ 
            success: true, 
            message: "Register deleted successfully",
            data: {
                id: register._id,
                name: register.name
            }
        });

    } catch (error) {
        next(error);
    }
};
export const getUsers = async (req, res, next) => {
    try {
        // 1. Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 2. Optional filtering
        const filter = {};
        if (req.query.name) {
            filter.name = { $regex: req.query.name, $options: 'i' };
        }
        if (req.query.email) {
            filter.email = { $regex: req.query.email, $options: 'i' };
        }

        // 3. Get users with pagination and filtering
        const users = await Register.find(filter)
            .select('-__v -createdAt -updatedAt') // Exclude some fields
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        // 4. Get total count for pagination info
        const total = await Register.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: users
        });

    } catch (error) {
        next(error);
    }
};
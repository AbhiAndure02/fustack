import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
        
    },
    subject:{
        type:String
    },
    message:{
        type:String,
        required:true
    }
}, { timestamps: true }
);


const Register = mongoose.model('Register', registerSchema)
export default Register;

import jwt from 'jsonwebtoken'
import { errorHandler } from './error'

export const verifyToken = (req, res, next) =>{
    const token = req.cookies.access_token;
    if(!token){
        return next(errorHandler(401, 'unauthorized'));
    }
    jwt.verify(token, process.env.JWT.SECRET,(err, user)=>{
        if(err){
            return next(errorHandler(401, 'unauthorized'));
        }
        req.user = user;
        next();
    })
}
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../constants/common';

export const signToken = async (id: string, role: number) => {
    return new Promise((res, rej) => {
        jwt.sign({id, role}, jwtSecret, {
            expiresIn: '7d'
        }, (err, encoded) => {
            if (err) {
                rej(err.message);
            } else {
                res(encoded);
            }
        })
    })
}

export const verifyToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, jwtSecret);
        return decoded;
    }
    catch(err) {
        return null;
    }
}
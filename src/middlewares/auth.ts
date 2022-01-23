import { Request, Response, NextFunction } from 'express';
import { OTHER, SUPERADMIN } from '../constants/roles';
import { getById } from '../helpers/db';
import { verifyToken } from '../helpers/jwt';
import party from '../models/party';

// export const superAdminAuth = (req: Request, res: Response, next: any) => {
//     const authHeader = req.headers.authorization;
//     if(authHeader) {
//         const decoded = verifyToken(authHeader);
//         if(decoded) {
//             // get the user and his / her info
//             if((decoded as any).role === SUPERADMIN.id) {
//                 // get the user
//                 req.body.user = 
//                 next();
//             } else {

//             }
//         }
//     } else {

//     }
// }


export const OtherAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(authHeader) {
        const decoded = verifyToken(authHeader);
        if(decoded) {
            
            // get the user and his / her info
            if((decoded as any).role === OTHER.id) {
                // get the user
                const partyUser = await getById(party, (decoded as any).id);
                req.body.user = partyUser;
                next();
            } else {
                return res.send({
                    data: null,
                    error: 'Unauthorized',
                    message: '',
                    status: 400
                })
            }
        }
    } else {
        return res.send({
            data: null,
            error: 'Unauthorized',
            message: '',
            status: 400
        })
    }
}


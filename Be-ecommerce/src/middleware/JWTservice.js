import jwt from 'jsonwebtoken';
import db from '../models';

// We remove the hardcoded exceptionPath array.
// The middleware will now only process the token if it exists.
// Route-specific protection is handled by applying this middleware selectively in routes.

const createJwtTokenService = (data) => {
    try {
        let key = process.env.JWT_SECRET || 'test_secret';
        let expIn = process.env.JWT_EXPIRES_IN || '1h';
        let token = '';
        if (data) {
            token = jwt.sign(data, key, { expiresIn: expIn });
        }
        return token;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

const verifyTokenService = (token) => {
    try {
        let key = process.env.JWT_SECRET || 'test_secret';
        let decoded = jwt.verify(token, key);
        return decoded;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

const checkCookieService = (req, res, next) => {
    try {
        let cookie = req.cookies.user;
        if (cookie) {
            let decoded = verifyTokenService(cookie);
            if (decoded) {
                req.user = decoded;
                next();
            } else {
                return res.status(401).json({
                    DT: '',
                    EC: 401,
                    EM: 'Token has been expired or invalid!'
                })
            }
        } else {
            return res.status(401).json({
                DT: '',
                EC: 401,
                EM: 'Not authenticated: Cookie not found!'
            })
        }
    }
    catch (e) {
        console.log(e);
        return res.status(401).json({
            DT: '',
            EC: 401,
            EM: 'Not authenticated'
        })
    }
}

const authenticateCookieService = async (req, res, next) => {
    try {
        // Reconstruct full path (e.g. /api + /user/get) to match Role URLs in DB
        let path = req.baseUrl + req.path;
        let isValid = await checkUserPermission(req.user, path);
        if (isValid === true) {
            next();
        } else {
            return res.status(403).json({
                DT: '',
                EC: 403,
                EM: 'You do not have permission to access this resource!'
            })
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
             DT: '',
             EC: -1,
             EM: 'Internal Server Error during authorization'
        });
    }
}

const checkUserPermission = async (user, path) => {
    try {
        let isValid = false;
        let result = await db.Group.findOne({
            where: { id: user.groupId },
            include: [{
                model: db.Role,
                attributes: ['id', 'url', 'description'],
                through: {
                    attributes: { exclude: ['GroupId', 'sizeId'] },
                },
            }],
        })
        
        if (result && result.Roles) {
             isValid = result.Roles.some(item => item.url === path)
        }
        return isValid;
    }
    catch (e) {
        console.log(e)
        return false;
    }
}

module.exports = {
    createJwtTokenService, verifyTokenService, checkCookieService, authenticateCookieService
}

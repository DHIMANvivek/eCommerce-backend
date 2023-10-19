const { verifyToken } = require('../helpers/jwt');

async function AdminVerify(req, res, next) {
    try {
        let data;
        if (req.headers.authorization)
            data = verifyToken(req.headers.authorization.split(' ')[1])

        if (data.role == 'user') {
            throw ({ message: 'You are not eligible for this route' });
        }

        req.tokenData = data;

        next();
    } catch (error) {

        res.status(500).json(error);

    }
}


module.exports = AdminVerify;


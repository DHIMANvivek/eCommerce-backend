const express = require('express');
const router = express.Router();
router.use('/', require('./v1/stripe/stripe'));

const app = express();

const socket = require('socket.io');
const server = app.listen(3000, () => console.log('chat server listening on port 3000!'));
let x = false;

const io = socket(server);
app.set('io', io);
io.sockets.on('connection', (socket) => {
    console.log(`new connection id: ${socket.id}`);
    sendData(socket);
})

function sendData(socket) {
    socket.emit('message', "hello world");
}

io.of('/chat').on('connection', function (socket) {
    require('../../controller/chat/chat').chatSocket(socket);
});

app.use(express.json());
const AdminVerify = require('../../middlewares/adminVerify');
const { verifyToken } = require('../../helpers/jwt');
const jwtVerify = require('../../middlewares/jwtVerify')
const paginateResults = require('../../helpers/pagination');
router.use('/user', require('./v1/user'));
router.use('/admin', AdminVerify, require('./v1/admin'));
router.use('/products', require('./v1/products'));
router.use('/reviews', require('./v1/reviews'));
router.use('/orders', require('./v1/orders'));
router.use('/cart', require('./v1/cart'));
router.use('/offer', require('./v1/offer'));
router.use('/wishlist', jwtVerify, require('./v1/wishlist'));
router.use('/socials', require('./v1/custom-website-elements/socials'));
router.use('/faqs', require('./v1/custom-website-elements/faqs'));
router.use('/paymentkeys', require('./v1/custom-website-elements/paymentKeys'));
router.use('/banners', require('./v1/custom-website-elements/banners'));
router.use('/sales', require('./v1/custom-website-elements/sales'));
router.use('/tc', require('./v1/tc'));

router.use('/deals', require('./v1/custom-website-elements/deals'));
router.use('/about', require('./v1/custom-website-elements/about'));
router.use('/razorpay', require('./v1/razorpay/payment'));

router.use('/deals', require('./v1/custom-website-elements/deals'));
router.use('/homeLayout', require('./v1/custom-website-elements/home-layout'));
// tickets
router.use('/ticket', require('./v1/support-ticket/ticket'));

// notification
router.use('/notification', require('./v1/notifications/notification'));
router.use('/tc', require('./v1/tc'));
router.use('/chat', require('./v1/chat/chat'));

router.get('/checkUser', (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        return res.status(200).json(verifyToken(token.split(' ')[1]).role);
    }
    return res.status(500).json(null);

})

// router.get('/getPaginatedData', getPaginatedData);

// async function getPaginatedData(req, res) {
//     // const modelName = req.params.model;
//     // const page = parseInt(req.query.page, 1) || 1;
//     // const pageSize = parseInt(req.query.pageSize, 5) || 10;

//     try {
//         // const Model = require(`../../models/custom-website-elements/${modelName}`);
//         // const data = await paginateResults(Model, page, pageSize);
//         const result = await faqModel.find({});

//         res.status(200).json(result);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }

router.use(function (req, res) {
    return res.status(404).json({
        success: false,
        error: 'errors.E_NOT_FOUND'
    });
});

module.exports = router;

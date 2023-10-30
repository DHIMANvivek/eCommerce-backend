const ordersModel = require('./../models/order');
const {getProductPrice}=require('../controller/products');
const {checkCoupon, updateCoupon,}=require('../controller/offers');
const ProductController=require('../controller/products');
async function getOrders(req, res) {
    try {
        const userOrders = await ordersModel.findOne({ buyerId: req.body._id });
        res.status(200).json(userOrders);
    } catch (error) {
        if (error.message) {
            res.status(500).json(error);
            return;
        }

        res.status(500).json(error);
    }
}



async function verifyOrderSummary(req,res){
    try {

            let response={};
           let result =await Promise.all( req.body.details.map(async (element) => {
                let response =await ProductController.fetchProductDetails(req,res,element.sku);
                // console.log('elemnt is ',element);
                return new Promise((res,rej)=>{
                        if(response.info.orderQuantity.includes(element.quantity)){
                            return res(response.price*element.quantity);
                        }
                        else{
                            rej(0);
                        }
                    });    
                }));

        let totalAmount=result.reduce((accumlater,currentValue)=>{
            return accumlater+currentValue;
        })

        response.subTotal=totalAmount;
        if(req.body.CouponApplied){
            // let coupon= await checkCoupon(req.body.CouponApplied._id,req.tokenData.id);
            let coupon=req.body.CouponApplied;
            if(!coupon){throw({message:'Sorry This Coupon is not available for you'})}
            if(coupon.minimumPurchaseAmount>totalAmount){ throw({message:`Minimum Purchase Amount is ${coupon.minimumPurchaseAmount}`})}
            let discount=0;
            if(coupon.discountType=='percentage'){
                let discountCalculated=(totalAmount/100)*coupon.discountAmount;
                // console.log('discountCalcluated is ',discountCalculated);
                discount=discountCalculated<=coupon.maximumDiscount?discountCalculated:coupon.maximumDiscount;
            }
            else{
                discount=coupon.discountAmount<=coupon.maximumDiscount?coupon.discountAmount:coupon.maximumDiscount;
            }



            totalAmount-=discount;
            response.savings=discount;
            response.total=totalAmount;
        }

        response.shipping=0;
        if(!response.savings) response.savings=0;
        if(!response.total) response.total=response.subTotal;
        res.status(200).json(response);
    } catch (error) {
        console.log('errpr comimg is ,',error);
            res.status(500).json(error);
    }
}


async function createOrder(req,res){
    try {
        req.body.buyerId=req.tokenData.id;
        if(req.body.coupon){
           let response= await checkCoupon(req.body.coupon._id,req.tokenData.id);
           if(!response){ throw({message:'You already use this coupon'})}
        }
        const orderCreated=ordersModel(req.body);
        orderCreated.save();

        await updateCoupon(req.body.coupon._id,req.tokenData.id);
        res.status(200).json('order created success');

    } catch (error) {
            console.log('error coming is ',error);
            res.status(500).json(error);
    }
}

async function getParicularUserOrders(req,res){
    try {
        const getAllOrders=await ordersModel.find({buyerId:req.tokenData.id});
        res.status(200).json(getAllOrders);
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = {
    getOrders,
    createOrder,
    verifyOrderSummary,
    getParicularUserOrders
}
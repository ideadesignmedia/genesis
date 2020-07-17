const express = require('express');
const router = express.Router();
const fs = require('fs');
const mail = require('./mailer');
const mongo = require('mongoose')
const Customer = require('./lwcust')
const Order = require('./lworder')
const Product = require('./lwprod')
const Visitor = require('./lwvisi')
const stripe = require('stripe')(process.env.STRIPE);
const track = function(req, res, next) {
    let dateDisplay = new Date();
    const cat = req.ip;
    const inca = req.originalUrl;
    Visitor.findOne({ip: cat}).then(result => {
        if (result == null) {
            let visy = new Visitor({
                _id: new mongo.Types.ObjectId(),
                ip: cat,
                visits: 1,
                visit: [{
                    date: dateDisplay,
                    page: [inca]
                }]
            })
            visy.save().then(()=>{
                return next();
            }).catch((e) => {
                res.status(500).json({
                    message: 'PAGE FAILED PLEASE TRY AGAIN | IDM Error Code:5991'
                });
            });      
        }
        if (result) {
            Visitor.collection.updateOne( {_id: result._id}, {$inc: {visits: 1},
                    $push: { visit: {date: dateDisplay, page: [inca]}}}
                ).then( result => {
                    return next();
                }).catch((e) => {
                    res.status(500).json(
                        {message: 'PAGE FAILED PLEASE TRY AGAIN | IDM Error Code:5990'}
                        );
                    });
            }
        }).catch((e)=>{
            res.status(500).json({
                message: 'PAGE FAILED PLEASE TRY AGAIN | IDM Error Code:5989'
            });
        });
}
auth = (req, res, next) => {
    if (req.cookies['admin'] === process.env.ADMINSECRET) {
        return next()
    } else {
        return res.status(500).json({
            error: true
        })
    }
}
sendNewOrderEmail = function(email, order) {
    return new Promise((res, rej) => {
        mail.confirmationIH(email, order).then(result => {
            if (result) {
                return res(true)
            } else {
                return res(false)
            }
        })
    })
}
router.get('/', track, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.readFile('./public/lwstore.html', (err, data) => {
        if (err) {
            res.json({
                error: true,
                message: 'failed to load the store'
            })
        }
        if (data) {
            res.write(data)
        }
        res.end()
    })
})
router.get('/products', (req, res) => {
    Product.find({}).exec().then(result => {
        return res.status(200).json({
            error: false,
            products: result
        })
    }).catch((e)=> {
        console.log(e)
        return res.status(500).json({
            message: 'error loading products',
            error: true
        })
    });
})
router.get('/admin', track, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.readFile('swadmin.html', (err, data) => {
        if (err) {
            res.json({
                error: true,
                message: 'failed to load the store'
            })
        }
        if (data) {
            res.write(data)
        }
        res.end()
    })
})
router.post('/admin-login', (req, res) => {
    if (req.body.identifier === process.env.ADMINUSERNAME) {
        if (req.body.password === process.env.ADMINPASSWORD) {
            return res.status(200).cookie('admin', process.env.ADMINSECRET, {maxAge: 1000*60*20}).json({auth: true})
        } else {
            return res.status(200).json({auth: false})
        }
    } else {
        return res.status(200).json({auth: false})
    }
})
router.get('/admindata', auth, (req, res) => {
    Order.find({}).exec().then(order => {
        Visitor.find({}).exec().then(visi => {
            Customer.find({}).exec().then(cust => {
                Product.find({}).exec().then(prod => {
                    return res.status(200).json({
                        orders: order,
                        visitors: visi,
                        customers: cust,
                        products: prod,
                        error: false
                    })
                }).catch((e) => {
                    console.log(e)
                    return res.status(500).json({
                        error: true
                    })
                });
            }).catch((e) => {
                console.log(e)
                return res.status(500).json({
                    error: true
                })
            });
        }).catch((e) => {
        console.log(e)
        return res.status(500).json({
            error: true
        })
        });
    }).catch((e) => {
        console.log(e)
        return res.status(500).json({
            error: true
        })
    })
})
router.post('/newprod', auth, (req, res) => {
    let price = req.body.price
    let quantity = req.body.quantity
    const product = new Product({
        _id: new mongo.Types.ObjectId(),
        name: req.body.name,
        price: price,
        quantity: quantity,
        image: req.body.image,
        description: req.body.description
    })
    console.log(product)
    product.save().then(saved => {
        console.log(saved)
        res.status(200).json({product: saved})
    }).catch((e) => {
        console.log(e)
        res.status(500).json({
            error: true
        })
    });
})
router.delete('/prod/:id', auth, (req, res) => {
    Product.findOneAndDelete({_id: req.params.id}, (err, deleted) => {
        if (err) {
            res.status(500).json({error: true})
        } else {
            res.status(200).json({error: false})
        }
    })
})
router.delete('/allprods', auth, (req, res) => {
    Product.deleteMany({}, (err, del) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                error: true
            })
        } else {
            return res.status(200).json({
                error: false
            })
        }
    })
})
router.post('/markcompleted', (req, res) => {
    Order.findOne({_id: req.body.id}, (err, order) => {
        if (err) {
            return res.status(500).json({
                error: true
            })
        }
        if (!order) {
            return res.status(500).json({
                error: true
            })
        }
        if (order) {
            order.completed = true
            order.save().then(saved => {
                return res.status(200).json({
                    error: false,
                    order: order
                })
            }).catch((e)=>{
                console.log(e)
                return res.status(500).json({
                    error: true
                })
            })
        }
    })
})
router.post('/createintents', (req, res) => {
    let that = req.body[0].customer.firstName
    const order = req.body[1].cartSelection
    const customer = req.body[0].customer;
    let details = []
    Product.find({}).exec().then(result => {
        if (result.length >= 1) {
            reveal = function(){
                let totquants = function(array){
                    let that = 0
                    for (a = 0; a < array.length; a++) {
                        that = that + parseInt(array[a].number)
                    }
                    return that
                }
                let total = 0
                result.forEach(product => {
                    for(i = 0; i < order.length; i++) {
                        console.log(order[i].product + ' ' + product._id)
                        if (order[i].product == product._id) {
                            details.push({product: product._id, quantity: order[i].quantity})
                            return total = total + (product.price * totquants(order[i].quantity))
                        }
                    }
                })
                return total
            }
            let sway = reveal()
            stripe.paymentIntents.create({
                amount: sway * 100,
                currency: 'usd',
                // Verify your integration in this guide by including this parameter
                metadata: {integration_check: 'accept_a_payment'},
            }, (err, intent) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        message: 'issue processing your request',
                        error: true
                    })
                }
                if (intent) {
                    let orderdate = new Date()
                    let orderid = new mongo.Types.ObjectId()
                    let theorder = Order({
                        _id: orderid,
                        customer: customer.email,
                        orderDate: orderdate,
                        orderItems: details,
                        paymentInfo: intent.id,
                        paymentAmount: intent.amount/100,
                        paid: false,
                        completed: false
                    })
                    theorder.save().then(neworder => {
                        if (neworder) {
                            Customer.findOne({email: customer.email}, (err, user) => {
                                if (err) {
                                    console.log(err)
                                    return res.status(500).json({
                                        message: 'issue processing your request',
                                        error: true
                                    })
                                }
                                if (!user) {
                                    let uad
                                    if (customer.address) {
                                        uad = [customer.address]
                                    } else {
                                        uad = []
                                    }
                                    const nu = new Customer({
                                        _id: new mongo.Types.ObjectId(),
                                        firstName: customer.firstName,
                                        lastName: customer.lastName,
                                        email: customer.email,
                                        address: uad,
                                        orders: [orderid] 
                                    })
                                    nu.save().then(saved => {
                                        console.log(saved)
                                        return res.status(200).json({
                                            client_secret: intent.client_secret,
                                            error: false
                                        });
                                    }).catch(e => {
                                        console.log(e)
                                        return res.status(500).json({
                                            error: true
                                        })
                                    })
                                }
                                if (user) {
                                    if (customer.address) {
                                        user.address.push(customer.address)
                                    }
                                    user.orders.push(orderid)
                                    user.save().then(saved => {
                                        console.log(saved);
                                        return res.status(200).json({
                                            client_secret: intent.client_secret,
                                            error: false
                                        });
                                    }).catch(e => {
                                        console.log(e)
                                        return res.status(500).json({
                                            error: true
                                        });
                                    })

                                }
                            })
                        }
                    }).catch((e)=>{console.log(e)});
                }
            }).catch((e) => {
                console.log(e)
                return res.status(500).json({
                    message: 'issue processing your request',
                    error: true
                })
            });
        } else {
            res.status(500).json({
                message: 'issue processing your request',
                error: true
            });
        }
    })
})
router.get('/resetusersandorder', auth, (req, res) => {
    Order.deleteMany({}).exec().catch((e => {console.log(e)}));
    Customer.deleteMany({}).exec().then( result => res.status(200).json({error: false})).catch((e) => {console.log(e)})
})
router.get('/users', auth, (req, res) => {
    Customer.find({}).exec().then(result => {res.status(200).json({users: result})}).catch((e)=>{res.status(500).json({error:true})})
})
updateQuanties = function(items) {
    console.log('SHOULD BE FIRST')
    return new Promise((res, rej) => {
        if (typeof items !== 'object') {
            console.log('NOT OBJECT Products.js:366')
            return rej()
        } else {
            for (i = 0; i < items.length; i++) {
                console.log('SEARCHING TO UPDATE' + JSON.stringify(items[i]))
                let mew = items[i].quantity
                Product.findOne({_id: items[i].product}, (err, result) => {
                    if (err) {
                        console.log(`^^^ ERROR RELATED TO UPDATING ${items[i]}`)
                        return rej(err)
                    }
                    if (!result) {
                        console.log(`COULD NOT FIND PRODUCT ${result} TO UPDATE QUANTITY`)
                        return rej(null)
                    }
                    if (result) {
                        console.log('FOUND RESULT ' + result)
                        totquants = function(array){
                            let that = 0
                            for (a = 0; a < array.length; a++) {
                                that = that + parseInt(array[a].number)
                            }
                            return that
                        }
                        try {
                            result.quantity -= totquants(mew)
                        } catch(e){
                            console.log(e)
                            console.log('FAILED TO UPDATE QUANTITY ON ' + items[i])
                        }
                        result.save().catch((e) => {
                            console.log(`ERROR SAVING UPDATED QUANTITY ${result} sub ${items[i]}`);
                            return rej(e)
                        })
                    }
                })
                if (i === items.length - 1) {
                    return res(true)
                }
            }
        }
    })
}
router.get('/inkquants', auth, (req, res) => {
    Product.updateMany({}, {$set: {quantity: 50}}, (err, prods) => {
        if (err){
            console.log(err)
            return res.status(500).json({
                error: true
            })
        }
        return res.status(200).json({
            error: false, 
            quantities: 50
        })
    })
})
router.post('/confirmpayments', (req, res) => {
    const customer = req.body.customer;
    Customer.findOne({email: customer.email}, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'failed to find user',
                error: true
            })
        }
        if (result) {
            let inca = result.orders[result.orders.length - 1]
            Order.findOne({_id: inca}, (err, order) => {
                if (err){
                    return res.status(500).json({
                        message: 'failed to find order',
                        error: true
                    })
                }
                if (order) {
                    order.paid = true
                    order.save().then(result => {
                        updateQuanties(result.orderItems).then(()=> sendNewOrderEmail(result.customer, result)).then(ordered => {
                            if (ordered) {
                                    return res.status(200).json({
                                        message: 'order updated',
                                        error: false
                                    })

                            } else {
                                return res.status(500).json({
                                    message: 'failed to save order',
                                    error: true
                                })
                            }
                        }).catch((e) => {
                            console.log(e)
                            return res.status(500).json({
                                error: true,
                                message: 'ERROR UPDATING PRODS'
                            })
                        })
                    }).catch((err)=> {
                        console.log(err);
                        return res.status(500).json({
                            message: 'failed to save order',
                            error: true
                        })
                    })
                }
            })
        }
    })
})
module.exports = router;
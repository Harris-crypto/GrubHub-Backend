const path = require("path");

const orders = require(path.resolve("src/data/orders-data"));

const nextId = require("../utils/nextId");

function exists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    
    if(!foundOrder) {
        return next({
            status: 404,
            message: `Dish not found ${orderId}`,
        });
    };
    res.locals.order = foundOrder;
    next();
}

function validateOrder(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    
    const requiredFields = ["deliverTo", "mobileNumber", "dishes"];
    for (const field of requiredFields) {
        if (!req.body.data[field]) {
            next({ status: 400, message: `A '${field}' property is required.` });
        }
    }
    
    if (!Array.isArray(dishes)) {
      return res.status(400).json({ error: "dishes must be an array" });
    }
    if (dishes.length < 1) {
      return res.status(400).json({ error: "dishes must be greater than one" });
    }
    
    for (const index in dishes) {
        if (typeof dishes[index].quantity !== "number") {
          return res.status(400).json({
            error: `Dish ${index} must have a quantity that is an integer greater than 0`,
          });
        }
        if (dishes[index].quantity < 1) {
          return res.status(400).json({
            error: `Dish ${index} must have a quantity that is an integer greater than 0`,
          });
        }
    }
    
    next();
}

function validateUpdate(req, res, next) {
    const { orderId } = req.params;
    const orderStatus = ['pending', 'preparing', 'out-for-delivery', 'delivered'];
    let newOrder = req.body.data;
    if(!newOrder.status || !orderStatus.includes(newOrder.status)) {
        return next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, or delivered`,
        });
    };
  
    if(!newOrder.id) newOrder.id = orderId;
    if(newOrder.id != orderId) {
        return next({
            status: 400,
            message: `Order id ${newOrder.id} does not match the route link!`
        });
    };
    next();
}

function list (req, res, next) {
    res.json({ data: orders });
}

function create(req, res, next) {
    let newOrder = req.body.data;
    newOrder.id = nextId();
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
    const { orderId } = req.params;
    res.json({ data: res.locals.order });
}

function update(req, res, next) {
    const { orderId } = req.params;
    let newOrder = req.body.data;
    if(!newOrder.id) newOrder.id = orderId;
    res.json({ data: newOrder });
}

function remove(req, res, next) {
    if(res.locals.order.status !== 'pending') {
        return next({
            status: 400,
            message: `Only a pending order can be removed!`,
        });
    };
    const index = orders.indexOf(res.locals.order);
    orders.splice(index, 1);
    res.sendStatus(204).json({ data: res.locals.order });
}

module.exports = {
    read: [exists, read],
    update: [exists, validateOrder, validateUpdate, update],
    list,
    create: [validateOrder, create],
    delete: [exists, remove]
}

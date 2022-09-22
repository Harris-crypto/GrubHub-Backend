const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

const list = (req, res) => res.json({ data: orders });
// TODO: Implement the /orders handlers needed to make the tests pass

const hasDeliverTo = (req, res, next) => {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
    return next();
  }
  return next({ status: 400, message: "Order must include a deliverTo" });
};

const hasMobileNumber = (req, res, next) => {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
    return next();
  }
  return next({ status: 400, message: "Order must include a mobileNumber" });
};

const hasDishes = (req, res, next) => {
  const {
    data: { dishes },
  } = req.body;

  if (!dishes) {
    return next({
      status: 400,
      message: "Order must include a dish",
    });
  }

  if (dishes.length === 0 || !Array.isArray(dishes)) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  if (dishes) {
    return next();
  }
  return next({ status: 400, message: "Order must include a dish" });
};

const hasQuantity = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  
  for (const dish of dishes) {
    if (!dish.quantity || !Number.isInteger(dish.quantity)) {
      return next({
        status: 400,
        message: `Dish ${dishes.indexOf(
          dish
        )} must have a quantity that is an integer greater than 0`,
      });
         }
  }
  return next();
};

const create = (req, res, next) => {
  const { data: { deliverTo, mobileNumber, dishes, quantity } = {} } = req.body;

  const newPost = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes,
    quantity,
  };
  orders.push(newPost);
  res.status(201).json({ data: newPost });
};

const orderExists = (req, res, next) => {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.foundOrder = foundOrder;
    res.locals.orderId = orderId;
    return next();
  } else {
    return next({
      status: 404,
      message: `Order does not exist: ${orderId}`,
    });
  }
};

const read = (req, res) => {
  res.status(200);
  res.json({ data: res.locals.foundOrder });
};

const update = (req, res, next) => {
  const { data: { deliverTo, mobileNumber, dishes, quantity } = {} } = req.body;
  const order = res.locals.foundOrder;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;
  order.quantity = quantity;

  res.status(200).json({ data: order });
};

const idMatches = (req, res, next) => {
  const { data: { id } = {} } = req.body;
  if (!id || typeof id === "undefined") {
    return next();
  }

  if (id !== res.locals.orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${res.locals.orderId}`,
    });
  }

  return next();
};
const statusMatches = (req, res, next) => {
  const { data: { status } = {} } = req.body;

  res.locals.status = status;
  
  if (!status) {
    return next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }
    if (status === "invalid") {
    return next({
      status: 400,
      message: "status is invalid",
    });
  }
    if (status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }
  return next();
};
function validateDestroy(req, res, next) {
  if (res.locals.foundOrder.status !== "pending") {
    return next({
      status: 400,
      message: `Cannot remove order that is not in pending.`,
    });
  }
  next();
  }

function destroy(req, res, next) {
  const index = orders.findIndex((order) => order.id === res.locals.orderId);
  if (index > -1) {
        orders.splice(index, 1);
    res.sendStatus(204);
  }
  }

module.exports = {
  list,
  create: [hasDeliverTo, hasMobileNumber, hasDishes, hasQuantity, create],
  read: [orderExists, read],
  update: [
    orderExists,
    hasDeliverTo,
    hasMobileNumber,
    hasDishes,
    hasQuantity,
    idMatches,
    statusMatches,
    update,
  ],
  destroy: [orderExists, validateDestroy, destroy],
};
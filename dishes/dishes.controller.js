const path = require("path");

const dishes = require(path.resolve("src/data/dishes-data"));

const nextId = require("../utils/nextId");

function exists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if(!foundDish){
        return next({
            status: 404,
            message: `Dish not found ${dishId}`,
        });
    };
    res.locals.dish = foundDish;
    next();
}

function validateDish(req, res, next) {
    const { data: { price } = {} } = req.body;
    const requiredFields = ["name", "description", "price", "image_url"];
    
    for (const field of requiredFields) {
      if (!req.body.data[field]) {
        next({ status: 400, message: `A '${field}' property is required.` });
      }
    }
    if (typeof price !== "number" || price < 1) {
        return res.status(400).json({ error: "price must be a number" });
      }
    if (price < 0) {
        return res
          .status(400)
          .json({ error: "price must be a number greater than zero" });
    }
    next();
}

function validateUpdate(req, res, next) {
    const { dishId } = req.params;
    const newDish = req.body.data;
    if(!newDish.id) newDish.id = dishId;
    if(newDish.id != dishId){
        return next({
            status: 400,
            message: `Dish id ${newDish.id} does not match the route link!`,
        });        
    }
    next();
}

function read(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    res.json({ data: foundDish });
}
function update(req, res, next) {
    const newDish = req.body.data;
    for(let dish of dishes){
        if(dish.id == newDish.id){
            Object.assign(dish, newDish);
        };
    };
    res.json({ data: newDish });
}

function list(req, res, next) {
    res.json({ data: dishes });
}

function create(req, res, next) {
    let newDish = req.body.data;
    newDish.id = nextId();
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

module.exports = {
    read: [exists, read],
    update: [exists, validateDish, validateUpdate, update],
    list,
    create: [validateDish, create],
}

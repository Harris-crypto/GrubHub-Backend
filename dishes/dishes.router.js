const router = require("express").Router();
const { list, create, read, update } = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/:dishId").get(read).put(update).all(methodNotAllowed);

router.route("/").get(list).post(create).all(methodNotAllowed);

module.exports = router;
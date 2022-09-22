const router = require("express").Router();
const { list, create, read, update, destroy } = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/:orderId")
  .get(read)
  .put(update)
  .delete(destroy)
  .all(methodNotAllowed);

router.route("/").get(list).post(create).all(methodNotAllowed);

module.exports = router;

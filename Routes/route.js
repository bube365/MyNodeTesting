const express = require("express");

const router = express.Router();

const categoryController = require("../Controller/category-controller");

router.get("/category/all", categoryController.getAllCategory);

router.get("/category/:category", categoryController.getCategory);

router.post("/createCat", categoryController.createCategories);

router.patch("/updatecategory", categoryController.updateCategory);

router.delete("/delete-category", categoryController.deleteCategory);

module.exports = router;

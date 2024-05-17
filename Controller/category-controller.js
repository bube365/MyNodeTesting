const HttpError = require("../models/http-errorModel");
const uuid = require("uuid");

let myItems = [
  {
    id: 1,
    category: "men",
    items: {
      item: "hat",
      description: "Mens Hat",
      price: 1500,
      currency: "USD",
    },
  },
  {
    id: 2,
    category: "men",
    items: {
      item: "Shirt",
      description: "Mens Shirt",
      price: 2500,
      currency: "USD",
    },
  },
  {
    id: 3,
    category: "women",
    items: {
      item: "hat",
      description: "Women Hat",
      price: 500,
      currency: "USD",
    },
  },
];

function generateUUID() {
  const timestamp = Date.now();
  const uuidTimestamp = uuid.v4();
  return `${uuidTimestamp}-${timestamp}`;
}

const getAllCategory = (req, res, next) => {
  const AllmyItems = myItems.map((items) => {
    return items;
  });

  res.json(AllmyItems);
};

const getCategory = (req, res, next) => {
  const categories = req.params.category;

  const mycategory = myItems.filter((cat) => {
    return cat.category === categories;
  });

  if (mycategory.length < 1) {
    throw new HttpError("Invalid category", 404);
  }

  res.json({ mycategory });
};

const createCategories = (req, res, next) => {
  const { category, newItems } = req.body;

  const createdCategory = {
    id: generateUUID(),
    category,
    items: newItems,
  };

  myItems.push(createdCategory);

  res.status(201).json(createdCategory);
};

const updateCategory = (req, res, next) => {
  const { category, items, id } = req.body;

  const categoryIndex = myItems.findIndex((item) => item.id === parseInt(id));

  myItems[categoryIndex].category = category;
  myItems[categoryIndex].items = items;

  res.status(200).json(myItems[categoryIndex]);
};

const deleteCategory = (req, res, next) => {
  const { id } = req.body;

  myItems = myItems.filter((item) => item.id !== parseInt(id));

  res.status(200).json({ message: "Category deleted successfully" });
};

exports.getAllCategory = getAllCategory;
exports.getCategory = getCategory;
exports.createCategories = createCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;

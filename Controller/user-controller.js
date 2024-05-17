const HttpError = require("../models/http-errorModel");
const uuid = require("uuid");

let usersData = [
  {
    id: 1,
    firstname: "duke",
    lastname: "duke",
    email: "duke@gmail.com",
    password: "duke1234@",
    country: "Nigeria",
  },
  {
    id: 2,
    firstname: "duke",
    lastname: "duke",
    email: "duke@gmail.com",
    password: "duke1234@",
    country: "Nigeria",
  },
  {
    id: 3,
    firstname: "duke",
    lastname: "duke",
    email: "duke@gmail.com",
    password: "duke1234@",
    country: "Nigeria",
  },
];

function generateUUID() {
  const timestamp = Date.now();
  const uuidTimestamp = uuid.v4();
  return `${uuidTimestamp}-${timestamp}`;
}

const getAllUser = (req, res, next) => {
  const AllmyItems = usersData.map((items) => {
    return items;
  });

  res.json(AllmyItems);
};

const userProfile = (req, res, next) => {
  const id = req.params.id;

  const mycategory = usersData.filter((cat) => {
    return cat.id === id;
  });

  if (mycategory.length < 1) {
    throw new HttpError("Invalid category", 404);
  }

  res.json({ mycategory });
};

// const createCategories = (req, res, next) => {
//   const { category, newItems } = req.body;

//   const createdCategory = {
//     id: generateUUID(),
//     category,
//     items: newItems,
//   };

//   myItems.push(createdCategory);

//   res.status(201).json(createdCategory);
// };

// const updateCategory = (req, res, next) => {
//   const { category, items, id } = req.body;

//   const categoryIndex = myItems.findIndex((item) => item.id === parseInt(id));

//   myItems[categoryIndex].category = category;
//   myItems[categoryIndex].items = items;

//   res.status(200).json(myItems[categoryIndex]);
// };

// const deleteCategory = (req, res, next) => {
//   const { id } = req.body;

//   myItems = myItems.filter((item) => item.id !== parseInt(id));

//   res.status(200).json({ message: "Category deleted successfully" });
// };

exports.getAllUser = getAllUser;
exports.userProfile = userProfile;
// exports.createCategories = createCategories;
// exports.updateCategory = updateCategory;
// exports.deleteCategory = deleteCategory;

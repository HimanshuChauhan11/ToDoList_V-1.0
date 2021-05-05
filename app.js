/*
 * Author: Himanshu Chauhan
 * Github:https://github.com/Himanshu0455349
 * Instagram:https://www.instagram.com/thakurchauhan198/
 * Please read README for full description, features and functionallity of *   * project
 */

// requiring installed packages
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ObjectID = require("mongoose").Types.ObjectId;
const _ = require("lodash");
// established mongoose connection
mongoose.connect("mongodb://localhost:27017/todoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
// Create Schema for string taskes in ToDo List
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Item = mongoose.model("Item", itemSchema);
// default items
const item1 = new Item({
  name: "Try to add your work here!",
});
const item2 = new Item({
  name: "Press + button to add your work",
});
const item3 = new Item({
  name: "Press x button to delete your work",
});

const defaultItems = [item1, item2, item3];

const listItemSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listItemSchema);
// For EJS views directory
app.set("view engine", "ejs");

// For body-parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// to get persent day date inside the our index.html
// let date = new Date();
// let options = {
//   weekday: "long",
//   day: "numeric",
//   month: "long",
// };
// let day = date.toLocaleDateString("en-US", options);
//For CSS Folder
app.use(express.static("public"));
//==========================
//get method for listTitle
//============================
app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully Inserted default items!");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", { listTitle: "Today", nItems: foundItems });
    }
  });
});
//===================== post method for inserting data ====================
app.post("/", function (req, res) {
  const itemName = req.body.add;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// ================== delete post method =========================

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox.trim();
  const listCame = req.body.listName.trim();

  if (listCame === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listCame },
      { $pull: { items: { _id: ObjectID(checkedItemId) } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listCame);
        }
      }
    );
  }
});

// ================== customList get method =========================
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          nItems: foundList.items,
        });
      }
    }
  });
});

// =========== appListening ===========
app.listen(3000, function () {
  console.log("Node Server at running at port 3000!");
});

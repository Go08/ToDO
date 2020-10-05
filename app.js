
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash")

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todoDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("item", itemSchema);

const item1= new Item({
  name:"Welcome to do list"
});

const item2= new Item({
  name:"Press + to add"
});

const item3= new Item({
  name:"<-- Press this to delete"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

   Item.find({},function(err, foundItems){
     if(foundItems.length === 0){
       Item.insertMany(defaultItems,function(err){
         if(!err){
           console.log("Insert-Success");
         }
       });
     }
        //found items contains the items from Items model
       res.render("list", {listTitle: "Today", newListItems: foundItems});
    });
});

app.post("/", function(req, res){

  const item = new Item({
    name:req.body.newItem
  });
  if(req.body.list === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: req.body.list}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" +req.body.list);
    });
  }

});

app.post("/delete", function(req,res){
  const hName=req.body.listName;
  console.log(hName);
  if(hName === "Today"){
    Item.findByIdAndDelete(req.body.checkbox, function(err){
      if(!err){
        console.log("Delete-Success!");
      }
      res.redirect("/");
    });
   }else{
    List.findOneAndUpdate( {name:hName}, {$pull: {items: {_id: req.body.checkbox}}}, function(err,foundList){
      if(!err){
        res.redirect("/" +hName);
      }
    });
  }


});

app.get('/:customListName', function(req, res){
    // const enteredName = req.params.customListName;
    // console.log(_.capitalize(enteredName));
        List.findOne({name:_.capitalize(req.params.customListName)}, function(err, foundList){
          if(!err){
            if(!foundList){
              //List doesn't exists! create new one;
              const list = new List({
                name:_.capitalize(req.params.customListName),
                items: defaultItems
              });

              list.save();
              res.redirect("/" +_.capitalize(req.params.customListName));
            }else{
              //console.log("list exists!");
              res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
          }
        });




});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

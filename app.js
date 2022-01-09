import express from "express";
import bodyParser from "body-parser";
import path from "path";
import mongoose from "mongoose";
import _ from "lodash";
import https from "https"

const app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
const __dirname=path.resolve();
mongoose.connect("mongodb+srv://admin:todolistappadmin@cluster0.v0ljl.mongodb.net/ListDB?retryWrites=true&w=majority",{useNewUrlParser:true});

const itemsSchema = new mongoose.Schema({
    name:String
}); 

const Item = mongoose.model("items",itemsSchema);

const item1 = new Item({
    name:"Welcome to Your ToDO List."
});
const item2 = new Item({
    name:"Write your work and hit + button to add in your list."
});
const item3 = new Item({
    name:"<-- Hit this when you have completed that work."
});

const deffaultItems=[item1,item2,item3];

const listSchema = {
    name:String,
    items:[itemsSchema]
};

const List = mongoose.model("lists",listSchema);

app.get("/",function(req,res){
    Item.find({},function(err,founditems){
        if(founditems.length===0){
            Item.insertMany(deffaultItems,function(){
                res.redirect("/");
            });
        }else{
            res.render("list",{listTitle:"Today", newListItems:founditems});
        }
    });
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items: deffaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
            }
        }
    });
    
});

app.post("/",function(req,res){
    let itemName = req.body.newitem;
    const listName = req.body.list;
    const item = new Item({
        name:itemName
    });

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(req,res){
    console.log("Server has started successfully!!");
});
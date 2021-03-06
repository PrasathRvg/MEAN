var express=require("express");
var app=express();
var {MongoClient,ObjectId} = require('mongodb');
var cors = require('cors');
var multer=require("multer");
var path=require("path");

app.use(express.static("uploads"))  
app.use(cors());

const storage=multer.diskStorage({destination:function(req,file,cb){
    cb(null,__dirname+"/uploads")
    },
    filename:function(req,file,cb){
    console.log("file in filename function::",file);
    var fileext=path.extname(file.originalname);
    const uniqueSuffix=Date.now()+"-"+Math.round(Math.random()*1E9)
    cb(null,file.fieldname+'-'+uniqueSuffix+fileext)
    }
})

const upload=multer({storage:storage})

const url = "mongodb://localhost:27017/";

app.set('view engine', 'pug');
app.set('views','./views');

app.use(express.urlencoded({extended: true})); 
app.use(express.json());  

//homepage
app.get("/",function(req,res){
    res.render("homepage.pug")
})

//contactlist

app.get("/contactlist",function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("delta");
        db.collection("contacts").find().toArray(function(err,data){
            res.render("contactlist",{
                details:data
            })
        })
    })
})

///contactlist for postman

// app.get("/list",function(req,res){
//     MongoClient.connect(url,function(err,conn){
//         var db=conn.db("delta");
//         db.collection("contacts").find().toArray(function(err,data){
//             res.send(data);
//         })
//     })
// })


//add contact form

app.get("/addcontact",function(req,res){
    res.render("addcontact")
})

app.post("/addcontact",upload.single('profilepic'),function(req,res){
    req.body.profilepic = req.file.filename;
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("delta");
        db.collection("contacts").insertOne(req.body,function(err,data){
            res.send("registered successfully")
            // res.redirect("/contactlist")
        })
    })
})


//delete contact

app.get("/deletecontact/:id",function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("delta")
        db.collection("contacts").deleteOne({_id:ObjectId(req.params.id)},function(err,data){
            // res.redirect("/contactlist")
            res.send("deleted successfully");
        })
    })    
})

//update contact

app.get("/editcontact/:id",function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("delta");
        db.collection("contacts").findOne({_id:ObjectId(req.params.id)},function(err,data){
            res.render("editcontact",{
                contact:data
            })
        })
    })
})

app.post("/editcontact",upload.single('profilepic'),function(req,res){
    MongoClient.connect(url,function(err,conn){
        console.log(req.body)
        var db=conn.db("delta")
        db.collection("contacts").updateOne({_id:ObjectId(req.body.id)},{
            $set:{
                    name:req.body.name,
                    mobile:req.body.mobile,
                    group:req.body.group,
                    profilepic:req.file.filename
                }
        },function(err,data){
            console.log(data)
            res.redirect("/contactlist")
            // res.send("edited successfully")
        })
    })
})

//middleware

function contacts(req,res,next){
    var group=req.url.replace("/","");
    // console.log("group::",group)
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("delta");
        db.collection("contacts").find({group:group}).toArray(function(err,data){
            details=data
            next()
        })
    })
}

app.get('/friend',contacts,function(req,res){
    // console.log("req.url::",req.url);
    res.render("contactlist.pug",{
        details:details
    })
})

app.get('/family',contacts,function(req,res){
    // console.log("req.url::",req.url);
    res.render("contactlist.pug",{
        details:details
    })
})

app.get('/work',contacts,function(req,res){
    // console.log("req.url::",req.url);
    res.render("contactlist.pug",{
        details:details
    })
})

app.get('/relative',contacts,function(req,res){
    // console.log("req.url::",req.url);
    res.render("contactlist.pug",{
        details:details
    })
})

app.listen(9999,function(req,res){
    console.log("Running on 9999")
})
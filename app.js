const express = require ("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user.js");
const path = require("path"); 
const Project = require("./models/project.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/tracking_system";

main().then(()=>{
    console.log("connected to DB");
})
.catch ((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req, res)=>{
    res.send("Hi,I am root");
});

app.get("/users", async(req,res)=>{
    const allUsers = await User.find({});
    res.render("home.ejs",{allUsers});
});

app.get("/users/new",(req,res)=>{
    res.render("creuser.ejs");
});

app.post("/users", async(req, res)=>{
    const newUser = new User(req.body);
    await newUser.save();
    res.redirect("/users");
});

app.get("/users/:id/projects/new", async(req, res)=>{
    let{id} = req.params;
    const user = await User.findById(id);
    res.render("new.ejs",{user});
});

app.post("/users/:id/projects", async(req, res)=>{
    let{id} = req.params;
    const newProject = new Project(req.body);
    newProject.owner =id;
    await newProject.save();
    res.redirect(`/users/${id}`);
});

app.get("/projects/:projectId/edit", async(req, res)=>{
    let{projectId} =req.params;
    const project = await Project.findById(projectId);
    res.render("edit.ejs",{project});
});

app.delete("/projects/:projectId", async(req, res)=>{
    let{projectId} = req.params;
    const project = await Project.findById(projectId);
    const userId = project.owner;
    await Project.findByIdAndDelete(projectId);
    res.redirect(`/users/${userId}`);
});

app.put("/projects/:projectId", async(req, res)=>{
    let{projectId} = req.params;
    const project = await Project.findById(projectId);
    const userId = project.owner;
    await Project.findByIdAndUpdate(projectId,req.body);
    res.redirect(`/users/${userId}`);
});

app.get("/users/:id", async(req, res)=>{
    let{id} = req.params;
    const user = await User.findById(id);
    const projects = await Project.find({owner:id});
    res.render("show.ejs",{user, projects});
});
app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});


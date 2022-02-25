const express = require('express');
const path = require('path');
const app = express();

const pathFile = path.resolve(__dirname, './public');
app.use(express.static(pathFile));

/*
app.set("view engine", "ejs");
app.set('views', path.join(__dirname,'/views'));
*/

app.listen (5000), () => {
    console.log("Larraz Store en funcionamiento!")
};

app.get('/' , (req,res) => {res.sendFile(path.resolve(__dirname, './views/index.html'))});
app.get('/products' , (req,res) => {res.sendFile(path.resolve(__dirname, './views/product-detail.html'))});
app.get('/cart' , (req,res) => {res.sendFile(path.resolve(__dirname, './views/product-cart.html'))});
app.get('/register' , (req,res) => {res.sendFile(path.resolve(__dirname, './views/register.html'))});
app.get('/login' , (req,res) => {res.sendFile(path.resolve(__dirname, './views/login.html'))});


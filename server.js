const express = require('express');
const ecommerce = express();
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
// const ProductsSchema = require('./schemas/Products');
// const UsersSchema = require('./schemas/Users');
// const ClientsSchema = require('./schemas/Clients');
// const CategoriesSchema = require('./schemas/Categories');
const md5 = require('md5');

const MONGODB_URL = 'mongodb://@localhost:27017/store';

mongoose.connect(MONGODB_URL, {useNewUrlParser: true}, err => {
    if (err) {
        console.error('[SERVER_ERROR] MongoDB Connection:', err);
        process.exit(1);
    }
    console.info('Mongo connected');
    ecommerce.listen(3000, () => {
    console.log('Escutando na porta 3000');
  });
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// const Products = mongoose.model('Product', ProductsSchema);
// const Users = mongoose.model('User', UsersSchema);
// const Clients = mongoose.model('Clients', ClientsSchema);
// const Categories = mongoose.model('Categories', CategoriesSchema);

ecommerce.use(bodyParser.json());       // to support JSON-encoded bodies
ecommerce.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


nunjucks.configure('views', {
    autoescape: true,
    express: ecommerce
});

ecommerce.use(express.static('public'));

//
ecommerce.get('/', (req,res) => {
	res.render('index.html');
});

ecommerce.get('/base', (req,res) => {
	res.render('layouts/base.html');
});



const express = require('express');
const ecommerce = express();
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const ProductsSchema = require('./schemas/Products');
// const UsersSchema = require('./schemas/Users');
const ClientsSchema = require('./schemas/Clients');
// const CategoriesSchema = require('./schemas/Categories');
const md5 = require('md5');

const MONGODB_URL = 'mongodb+srv://fabiozucco:gu76ejrs@dbproject-bskcx.gcp.mongodb.net/dbproject-bskcx?retryWrites=true&w=majority';

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

const Products = mongoose.model('Products', ProductsSchema);
// const Users = mongoose.model('User', UsersSchema);
const Clients = mongoose.model('Clients', ClientsSchema);
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




// REQUISIÇÃO - CLIENTES

ecommerce.post('/form', (req, res) => {
  var client = new Clients(req.body);

  if (client.password && client.password.length > 0) {
    client.password = md5(client.password);
  }

  client.save((err, client) => {
    console.info(client.name + ' salvo');
    res.send('ok');
  })
});

ecommerce.post('/admin/form', (req, res) => {
  var client = new Clients(req.body);

  if (client.password && client.password.length > 0) {
    client.password = md5(client.password);
  }

  client.save((err, client) => {
    console.info(client.name + ' salvo');
    res.send('ok');
  })
});

ecommerce.put('/admin/form', (req, res) => {
  const data = req.body;
  if (data.password && data.password.length > 0) {
    data.password = md5(data.password);
  }
  Clients.updateOne({_id: data._id}, data,  (err, client) => {
    console.info(data.name + ' salvo');
    res.send('ok');
  });
});

ecommerce.get('/admin/form', (req, res) => {
  Clients.find((err, clients) => {
       res.render('admin/form.html', {clients: clients});
     });
 });

 ecommerce.delete('/admin/form/:id', (req, res) => {
  Clients.findOneAndRemove({_id: req.params.id}, (err, obj) => {
    if(err) {
      res.send('error');
    }
    res.send('ok');
  });
});

//



// REQUISIÇÃO - PRODUTOS

ecommerce.post('/admin/products', (req, res) => {
  var product = new Products(req.body);

  product.save((err, product) => {
    console.info('Produto:'+ product.name + ' salvo');
    res.send('ok');
  })
});

ecommerce.put('/admin/products', (req, res) => {
  const data = req.body;

  Products.updateOne({_id: data._id}, data,  (err, client) => {
    console.info('Produto:'+ data.name + ' salvo');
    res.send('ok');
  });
});

ecommerce.get('/admin/products', (req, res) => {
  Products.find((err, products) => {
       res.render('admin/products.html', {products: products});
     });
 });

 ecommerce.delete('/admin/products/:id', (req, res) => {
  Clients.findOneAndRemove({_id: req.params.id}, (err, obj) => {
    if(err) {
      res.send('error');
    }
    res.send('ok');
  });
});

//




// GET

ecommerce.get('/', (req,res) => {
	res.render('index.html');
});

ecommerce.get('/base', (req,res) => {
	res.render('layouts/base.html');
});

ecommerce.get('/admin', (req,res) => {
	res.render('admin/admin.html');
});

ecommerce.get('/form', (req,res) => {
	res.render('form.html');
});

ecommerce.get('/products', (req, res) => {
  Products.find((err, products) => {
       res.render('products.html', {products: products});
     });
 });







//API - CLIENTES

ecommerce.get('/api/clients', (req, res) => {
  res.send(listClients);
});

ecommerce.get('/api/clients/:id', (req, res) => {
  Clients.find({"_id": req.params.id }, (err, obj) => {
      if (err) {
        res.send(null);
      } else {
        const client = obj[0];
        res.send(client);
      }
  });
});



//API - PRODUTOS
ecommerce.get('/api/products', (req, res) => {
  res.send(listProducts);
});

ecommerce.get('/api/products/:id', (req, res) => {
  Products.find({"_id": req.params.id }, (err, obj) => {
      if (err) {
        res.send(null);
      } else {
        const product = obj[0];
        res.send(product);
      }
  });
});
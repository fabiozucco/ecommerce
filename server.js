const express = require('express');
const ecommerce = express();
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const ProductsSchema = require('./schemas/Products');
const ClientsSchema = require('./schemas/Clients');
const ContactsSchema = require('./schemas/Contacts');
const CategoriesSchema = require('./schemas/Categories');
const md5 = require('md5');

const MONGODB_URL = 'mongodb+srv://fabiozucco:gu76ejrs@dbproject-bskcx.gcp.mongodb.net/dbproject-bskcx?retryWrites=true&w=majority';

let env = nunjucks.configure('views', {
    autoescape: true,
    express: ecommerce
});

require('useful-nunjucks-filters')(env);

ecommerce.set('engine', env);

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
const Contacts = mongoose.model('Contacts', ContactsSchema);
const Clients = mongoose.model('Clients', ClientsSchema);
const Categories = mongoose.model('Categories', CategoriesSchema);

ecommerce.use(bodyParser.json());       // to support JSON-encoded bodies
ecommerce.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

ecommerce.use(express.static('public'));

ecommerce.use((req, res, next) => {
  const engine = res.app.get('engine');
  Categories.aggregate([{
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "category",
      as: "products" 
    }
  }]).sort('name').exec((err, obj) => {
    engine.addGlobal('categories', obj);
    next();
  });
});




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

ecommerce.get('/c/:slug', (req, res) => {
  Categories.aggregate([
    {$match: {slug: req.params.slug}},
    {
    $lookup: {
        from: "products", // collection name in db
        localField: "_id",
        foreignField: "category",
        as: "products"
    }
  }]).exec((err, obj) => {
     res.render('products.html', {products: obj[0].products});
 });
});

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

 // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise/all

  const promiseProducts = Products.aggregate([{
    $lookup: {
        from: "categories", // collection name in db
        localField: "category",
        foreignField: "_id",
        as: "categoryObject"
    }
  }]).sort('name').exec();

  const promiseCategories = Categories.find().sort('name').exec();
  
  Promise.all([promiseProducts, promiseCategories]).then ((values) => {
    const products = values[0];
    const categories = values[1];
    res.render('admin/products.html', {categories: categories, products: products});
  })  
});
  
// });

 ecommerce.delete('/admin/products/:id', (req, res) => {
  Products.findOneAndRemove({_id: req.params.id}, (err, obj) => {
    if(err) {
      res.send('error');
    }
    res.send('ok');
    console.info('Produto:'+ req.params.name + ' removido');
  });
});

//


// CATEGORIAS

ecommerce.delete('/admin/category/:id', (req, res) => {
  Categories.findOneAndRemove({_id: req.params.id}, (err, obj) => {
    if(err) {
      res.send('error');
    }
    res.send('ok');
  });
});

// ecommerce.get('/admin/list-products', (req, res) => {
//   Products.aggregate([{
//     $lookup: {
//         from: "categories", // collection name in db
//         localField: "category",
//         foreignField: "_id",
//         as: "categoryObject"
//     }
//   }]).sort('name').exec((err, obj) => {
//       res.render('admin/list-products.html', {products: obj});
//   });
// });

ecommerce.get('/admin/list-categories', (req, res) => {
  Categories.find().sort('name').exec((err, obj) => {
      res.render('admin/list-categories.html', {categories: obj});
  });
});

ecommerce.get('/admin/categories', (req, res) => {
  res.render('admin/categories.html');
});


ecommerce.post('/admin/categories', (req, res) => {
  var newCategory = new Categories(req.body);
  newCategory.save((err, newCategory) => {
    console.info(newCategory.name + ' salvo');
    res.send('ok');
  })
});


// GET

ecommerce.get('/', (req,res) => {
  Products.find().limit(3).sort({_id: 'desc'}).exec((err, products) => {
      res.render('index.html', {products: products})
  });
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

ecommerce.get('/cart', (req,res) => {
  res.render('cart.html');
});

ecommerce.get('/products', (req, res) => {
  const filter = req.query.filter;  
  const query = req.query.q;
  let cond = [];
  let queryObj = {};
  if (filter === 'lower_price') {
    cond = ['price', 0];
  } else if (filter === 'higher_price') {
    cond = ['price', -1];
  }   

  if (query && query.length > 0) {
    queryObj = {"name": { "$regex": query, "$options": "i" }};
  }
  Products.find(queryObj).sort([cond]).exec((err, products) => {
     res.render('products.html', {products: products, q: query});
  });  
 });


// REQUISIÇÃO - LOGIN

ecommerce.post('/login', (req, res) => {
  Clients.find({'email': req.body.email, 'password': md5(req.body.password)}, (err, obj) => {
    if (err || obj.length === 0) {
      res.send('error');
    } else {
      res.send('ok');
    }
  })
})




// REQUISIÇÃO - CONTATOS

ecommerce.get('/contact', (req,res) => {
  res.render('contact.html');
});

ecommerce.post('/contact', (req, res) => {
  var contact = new Contacts(req.body);

  contact.save((err, contact) => {
    console.info('Mensagem recebida de :'+ contact.name);
    res.send('ok');
  });

  var email = req.body.email;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'senacerechim2019@gmail.com',
      pass: 'senacrserechim'
    }
  });
  const mailOptions = {
    from: 'senacerechim2019@gmail.com',
    to: email,
    subject: 'Confirmação de recebimento - ATC Forniture',
    text: 'Olá, ' + req.body.name + '. Agradeçemos por entrar en contato, nossa equipe responderá o mais breve possível. Enquanto isso, não deixe de checar nossas novidades. Att, ATC Forniture.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
    res.send('ok');
  });
});

 ecommerce.delete('/admin/contact/:id', (req, res) => {
  Contacts.findOneAndRemove({_id: req.params.id}, (err, obj) => {
    if(err) {
      res.send('error');
    }
    res.send('ok');
  });
});

ecommerce.get('/admin/contact', (req, res) => {
  Contacts.find((err, contacts) => {
       res.render('admin/contact.html', {contacts: contacts});
     });
 });



ecommerce.post('/admin/contact', (req, res) => {
  var response = req.body;

  var id = req.body.id;
  var email = req.body.email;
  var subject = req.body.subject;
  var responsa = req.body.response;



  console.info('Mensagem enviada à: '+ email);

  // response.save((err, response) => {
  // console.info('Mensagem enviada à: '+ response.email);
  // res.send('ok');
  // });
 

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'senacerechim2019@gmail.com',
      pass: 'senacrserechim'
    }
  });
  const mailOptions = {
    from: 'senacerechim2019@gmail.com',
    to: email,
    subject: subject,
    text: responsa
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
    res.send('ok');
  });
});








// // REQUISIÇÃO - RESPONSE

// ecommerce.get('/admin/response', (req, res) => {
//   Contacts.find((err, contacts) => {
//        res.render('admin/response.html', {contacts: contacts});
//      });
//  });

// ecommerce.post('/admin/response', (req, res) => {
//   var contact = new Contacts(req.body);

//   contact.save((err, contact) => {
//     console.info('Mensagem recebida de :'+ contact.name);
//     res.send('ok');
//   });



//   var email = req.body.email;
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'senacerechim2019@gmail.com',
//       pass: 'senacrserechim'
//     }
//   });
//   const mailOptions = {
//     from: 'senacerechim2019@gmail.com',
//     to: email,
//     subject: 'Confirmação de recebimento - ATC Forniture',
//     text: 'Olá, ' + req.body.name + '. Agradeçemos por entrar em contato, nossa equipe responderá o mais breve possível. Enquanto isso, não deixe de checar nossas novidades. Att, ATC Forniture.'
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//     res.send('ok');
//   });
// });

//  ecommerce.delete('/admin/contact/:id', (req, res) => {
//   Contacts.findOneAndRemove({_id: req.params.id}, (err, obj) => {
//     if(err) {
//       res.send('error');
//     }
//     res.send('ok');
//   });
// });







//API - CLIENTES

// ecommerce.get('/api/clients', (req, res) => {
//   res.send(listClients);
// }); 

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
// ecommerce.get('/api/products', (req, res) => {
//   res.send(listProducts);
// });

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



//API - CONTATOS
// ecommerce.get('/api/contact', (req, res) => {
//   res.send(listContacts);
// });

ecommerce.get('/api/contact/:id', (req, res) => {
  Contacts.find({"_id": req.params.id }, (err, obj) => {
      if (err) {
        res.send(null);
      } else {
        const contact = obj[0];
        res.send(contact);
      }
  });
});
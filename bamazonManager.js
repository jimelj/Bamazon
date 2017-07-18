/*jshint esversion:6*/
let mysql = require('mysql');
let inquirer = require('inquirer');
let chalk = require('chalk');

let pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'Bamazon'
});

pool.getConnection(function(err, connection) {
  if (err) {
    console.log('connection err');
    console.log(err);
    console.log('connected as id ' + connection.threadId);
  }
});

function init() {
  console.log(chalk.bgCyan.white.bold('          -----------Welcome to Bamazon-----------          '));
  inquirer.prompt([ /* Pass your questions in here */ {
    type: "list",
    name: "pick",
    message: "Manager Console",
    choices: [
      'View Products for Sale',
      'View Low Inventory',
      'Add to Inventory',
      'Add New Product',

    ]
  }]).then(function(answers) {
    // Use user feedback for... whatever!!
    switch (answers.pick) {
      case 'View Products for Sale':
        products();
        break;
      case 'View Low Inventory':
        low();
        break;
      case 'Add to Inventory':
        add();
        break;
      case 'Add New Product':
        newProduct();
        break;
    }
  });
}

function products() {
  pool.query('SELECT * FROM Products', function(error, results) {
    pool.end();
    if (error) throw error;
    for (let i = 0; i < results.length; i++) {
      console.log(results[i].id + " | " + results[i].product_name + " | " + results[i].department_name + " | " + 'Price: $' + results[i].price + " | " + "Quantity: " + results[i].stock_quantity);
    }
  });
}

function low() {
  pool.query('SELECT * FROM Products', function(error, results) {
    pool.end();
    if (error) throw error;
    for (let i = 0; i < results.length; i++) {
      if (results[i].stock_quantity < 5) {
        console.log(chalk.red('LOW!!!!!' + results[i].id + " | " + results[i].product_name + " | " + results[i].department_name + " | " + 'Price: ' + results[i].price + " | " + "Quantity: " + results[i].stock_quantity));
      } else if (results[i].stock_quantity > 5) {
        console.log(results[i].product_name, 'has enough stock');
      }
    }
  });
}

function add() {
  pool.query('SELECT * FROM Products', function(error, results) {
    // connection.release();
    if (error) throw error;
    for (let i = 0; i < results.length; i++) {
      console.log(results[i].id + " | " + results[i].product_name + " | " + results[i].department_name + " | " + results[i].price + " | " + "Quantity: " + results[i].stock_quantity);
    }

    inquirer.prompt([{
        name: 'userId',
        message: 'Please provide the ID of the product you would like to restock?'
      },
      {
        name: 'units',
        message: 'How many units would you like to add?'

      }

    ]).then(function(answers) {
      pool.query('SELECT * FROM Products WHERE id=?', [answers.userId], function(error, results) {
        if (error) throw error;
        let {
          id,
          product_name,
          department_name,
          price,
          stock_quantity
        } = results[0];
        console.log(id + " | " + product_name + " | " + department_name + " | " + price);
        pool.query('UPDATE Products SET ? WHERE ?', [{
            stock_quantity: parseInt(stock_quantity) + parseInt(answers.units)
          },
          {
            id: answers.userId
          }

        ], function(error, results) {
          pool.end();
          if (error) throw error;
          console.log(results);
        });


      });
    });
  });
}

function newProduct() {

  pool.query('SELECT * FROM Products', function(error, results) {
    // pool.end();
    if (error) throw error;
    for (let i = 0; i < results.length; i++) {
      console.log(results[i].id + " | " + results[i].product_name + " | " + results[i].department_name + " | " + results[i].price + " | " + "Quantity: " + results[i].stock_quantity);
    }

    inquirer.prompt([{
        name: 'product',
        message: 'What new product would you like to add?'
      },
      {
        name: 'deparment',
        message: 'Deparment to sell this product?'

      },
      {
        name: 'price',
        message: 'Price of product?'
      },
      {
        name: 'stock',
        message: 'Initial Stock?'
      }

    ]).then(function(answers) {
      pool.query('INSERT INTO Products set ?', {
        product_name: answers.product,
        department_name: answers.deparment,
        price: answers.price,
        stock_quantity: answers.stock

      }, function(error, results) {
        pool.end();
        if (error) throw error;

        console.log('results');
        console.log(results);
      });
    });
  });
}

init();

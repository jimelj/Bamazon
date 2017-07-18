/*jshint esversion:6*/
let mysql = require('mysql');
let inquirer = require('inquirer');
let chalk = require('chalk');

let pool = mysql.createPool({
  // connectionLimit: 10,
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
  }

  console.log('connected as id ' + connection.threadId);
  pool.query('SELECT * FROM Products', function(error, results) {
    // connection.release();
    if (error) throw error;
    for (let i = 0; i < results.length; i++) {
      console.log(results[i].id + " | " + results[i].product_name + " | " + results[i].department_name + " | " +'Price: $' +results[i].price + " | " +'Stock: '+ results[i].stock_quantity);
    }

  console.log(chalk.bgCyan.white.bold('          -----------Welcome to Bamazon-----------          '));

  inquirer.prompt([{
      name: 'userId',
      message: 'Please provide the ID of the product you would like to buy?'
    },
    {
      name: 'units',
      message: 'How many units of the product would you like to buy?'

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
      let newStock = stock_quantity - answers.units;
      if (parseInt(answers.units) <= parseInt(stock_quantity)) {
        console.log('Order Placed');
        console.log('Cost Purchase',price*answers.units);
        pool.query('UPDATE Products SET ? WHERE ?', [{
            stock_quantity: newStock
          },
          {
            id: answers.userId
          }

        ], function(error, results) {
          pool.end();
          if (error) throw error;
          // console.log(results);
        });

      } else {
        console.log('Insufficient quantity!');
      }
    });
  });
  });
});

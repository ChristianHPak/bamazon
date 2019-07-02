var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "C17F7F5CBAEAEFD0",
    database: "bamazon"
})

connection.connect(function (err) {
    if (err) throw err;
    showProducts();
});

//Show the table with products for consumer to view
function showProducts(answer) {
    var query = "SELECT item_id,product_name,price,stock_quantity FROM products";
    connection.query(query, function (err, response) {
        if (err) throw err;

        var theDisplayTable = new Table({
            head: ['Item ID', 'Product Name', 'Price', 'Quantity'],

            colWidths: [10, 30, 10, 14]
        });

        for (var i = 0; i < response.length; i++) {
            theDisplayTable.push(
                [response[i].item_id, response[i].product_name, response[i].price, response[i].stock_quantity]
            );
        }
        console.log(theDisplayTable.toString());

        pickProduct();
    });
}
//Pick a product and how many
function pickProduct(answer) {
    inquirer.prompt([{
            name: "item",
            type: "input",
            message: "Enter the ID of the item you would like to purchase"
        },
        {
            name: "count",
            type: "input",
            message: "How many would you like to buy?"
        }]).then(function (answer) {
        connection.query("SELECT item_id,product_name,price,stock_quantity FROM products WHERE ?", {
            item_id: answer.item
        }, function (err, response) {

            //console.log("count " + answer.count);

            if (parseInt(answer.count) > response[0].stock_quantity) {

                console.log("sorry, there are only " + response[0].stock_quantity + " left");
                pickProduct();

            } else {
                console.log("Your purchase of " + answer.count + ' ' + response[0].product_name + "/s total cost is: $ " + parseInt(response[0].price) * parseInt(answer.count));
                var quantityLeft = response[0].stock_quantity - answer.count;
                console.log(quantityLeft);
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [{
                            stock_quantity: quantityLeft
                        },
                        {
                            item_id: answer.item
                        }
                    ],
                    function (error) {
                        if (error) throw err;


                    });
                console.log("Inventory updated. There are  " + quantityLeft + " left");
                showProducts();
            }
        })
    });
};
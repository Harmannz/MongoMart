[![Build Status](https://travis-ci.org/Harmannz/MongoMart.svg?branch=master)](https://travis-ci.org/Harmannz/MongoMart)
# MongoMart
### About
MongoMart is the final lab project in M101JS mongodb for javascript course provided by MongoDB.   
MongoMart is an ecommerce site that allows the user to browse for and add MongoDB products to their cart.   
There is no user session at the moment, so the user id is hard coded.   

### Requires   
* Node.js (with npm)
* MongoDB 3.2.x, using the WiredTiger (default for 3.2) storage engine

### Getting Started
> First install required npm depedencies by running   

`npm install`

>Import the item collection and cart collection from M101js final lab handout

`mongoimport -d mongomart -c item --maintainInsertionOrder data/items.json`   
`mongoimport -d mongomart -c cart --maintainInsertionOrder data/cart.json`   

>Run the application by typing "node mongomart.js" in the mongomart directory.

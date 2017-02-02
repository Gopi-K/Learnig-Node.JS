/* global __CONFIG__ */
'use strict';

// Third party modules
var fs = require('fs');
var async = require('async');
var util = require('util');

// Internal modules
var AppService = require(__CONFIG__.app_code_path + 'app-service.js');
var GetStatus = require(__CONFIG__.app_lib_path + 'status.js');
var ShoppingCartModel = require(__CONFIG__.app_code_path + 'shopping-cart/shopping-cart-model.js');

function ShoppingCartService(app) {
  AppService.call(this);
}

util.inherits(ShoppingCartService, AppService);

// To retrive all products list in the shopping Cart
ShoppingCartService.prototype.getMyCart = function (options, cb) {
  var mCart = new ShoppingCartModel();
  mCart.getMyCart(options, cb);
};


//To add products to the shopping Cart
ShoppingCartService.prototype.addProductsToCart = function (options, cb) {
  var mCart = new ShoppingCartModel();
  mCart.addProductsToCart(options, cb);
};

//To remove products from the Cart
ShoppingCartService.prototype.removeProductsFromCart = function (options, cb) {
  var mCart = new ShoppingCartModel();
  mCart.removeProductsFromCart(options, cb);
};

//To update the quantities of products in the  Cart
ShoppingCartService.prototype.updateQuantitiesInCart = function (options, cb) {
  var mCart = new ShoppingCartModel();
  mCart.updateQuantitiesInCart(options, cb);
};

// To get total cost of items in the shopping Cart
ShoppingCartService.prototype.getTotalCost = function (options, cb) {
  var mCart = new ShoppingCartModel();
  mCart.getTotalCost(options, cb);
};

// To save buyer details while checking out of cart
ShoppingCartService.prototype.checkOutCart = function (options, cb) {
  var mCart = new ShoppingCartModel();
  mCart.checkOutCart(options, cb);
};

// To get total sales of products from the shopping Cart
ShoppingCartService.prototype.getTotalSales = function (options, cb) {
  var mCart = new ShoppingCartModel();
  mCart.getTotalSales(options, cb);
};

module.exports = ShoppingCartService;
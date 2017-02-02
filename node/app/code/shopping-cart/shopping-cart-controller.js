/* global __CONFIG__ */
'use strict';

// Third party modules
var fs = require('fs');
var async = require('async');
var util = require('util');

// Internal modules
var GetStatus = require(__CONFIG__.app_lib_path + 'status.js');
var AppController = require(__CONFIG__.app_code_path + 'app-controller.js');
var ShoppingCartService = require(__CONFIG__.app_code_path + 'shopping-cart/shopping-cart-service.js');

function ShoppingCartController(app) {
  AppController.call(this);

  app.httpGet({
    url: '/getMyCart',
    route: this.getMyCart.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPost({
    url: '/addProductsToCart',
    route: this.addProductsToCart.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpDelete({
    url: '/removeProductsFromCart',
    route: this.removeProductsFromCart.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPut({
    url: '/updateQuantitiesInCart',
    route: this.updateQuantitiesInCart.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpGet({
    url: '/getTotalCost',
    route: this.getTotalCost.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPost({
    url: '/checkOutCart',
    route: this.checkOutCart.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpGet({
    url: '/getTotalSales',
    route: this.getTotalSales.bind(this),
    isPublic: true,
    isAdmin: false
  });

}

util.inherits(ShoppingCartController, AppController);

// To retrive all products list in the shopping Cart
ShoppingCartController.prototype.getMyCart = function (request, response) {
  var that = this;
  var sCart = new ShoppingCartService();
  sCart.getMyCart(null, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

//To add products to the shopping Cart
ShoppingCartController.prototype.addProductsToCart = function (request, response) {
  var that = this;
  var sCart = new ShoppingCartService();
  var objC = request.body;
  sCart.addProductsToCart(objC, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

//To remove products from the Cart
ShoppingCartController.prototype.removeProductsFromCart = function (request, response) {
  var that = this;
  var sCart = new ShoppingCartService();
  var objC = request.body;
  sCart.removeProductsFromCart(objC, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

//To update the quantities of products in the  Cart
ShoppingCartController.prototype.updateQuantitiesInCart = function (request, response) {
  var that = this;
  var sCart = new ShoppingCartService();
  var objC = request.body;
  sCart.updateQuantitiesInCart(objC, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

// To get total cost of items in the shopping Cart
ShoppingCartController.prototype.getTotalCost = function (request, response) {
  var that = this;
  var sCart = new ShoppingCartService();
  sCart.getTotalCost(null, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

// To save buyer details while checking out of cart
ShoppingCartController.prototype.checkOutCart = function (request, response) {
   var that = this;
   var sCart = new ShoppingCartService();
   var objUser = request.body;
   sCart.checkOutCart(objUser, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

// To get total sales of products from the shopping Cart
ShoppingCartController.prototype.getTotalSales = function (request, response) {
  var that = this;
  var sCart = new ShoppingCartService();
  sCart.getTotalSales(null, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

module.exports = ShoppingCartController;
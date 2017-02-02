/* global __CONFIG__ */
'use strict';

// Third party modules
var fs = require('fs');
var async = require('async');
var util = require('util');

// Internal modules
var GetStatus = require(__CONFIG__.app_lib_path + 'status.js');
var AppController = require(__CONFIG__.app_code_path + 'app-controller.js');
var ProductService = require(__CONFIG__.app_code_path + 'product/product-service.js');

function ProductController(app) {
  AppController.call(this);

  app.httpGet({
    url: '/getProducts',
    route: this.getProducts.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPost({
    url: '/insertProduct',
    route: this.insertProduct.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpDelete({
    url: '/removeProduct',
    route: this.removeProduct.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPut({
    url: '/updateProduct',
    route: this.updateProduct.bind(this),
    isPublic: true,
    isAdmin: false
  });
}

util.inherits(ProductController, AppController);

// To retrive all products list from the database
ProductController.prototype.getProducts = function (request, response) {
  var that = this;
  var sProduct = new ProductService();
  sProduct.getProducts(null, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

//To insert a new product details into database
ProductController.prototype.insertProduct = function (request, response) {
  var that = this;
  var sProduct = new ProductService();
  var objP = request.body;
  sProduct.insertProduct(objP, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

//To remove a product from database
ProductController.prototype.removeProduct = function (request, response) {
  var that = this;
  var sProduct = new ProductService();
  var objP = request.body;
  sProduct.removeProduct(objP, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

//To update a product details in the  database
ProductController.prototype.updateProduct = function (request, response) {
  var that = this;
  var sProduct = new ProductService();
  var objP = request.body;
  sProduct.updateProduct(objP, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

module.exports = ProductController;
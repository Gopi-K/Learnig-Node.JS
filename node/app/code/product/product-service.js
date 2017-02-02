/* global __CONFIG__ */
'use strict';

// Third party modules
var fs = require('fs');
var async = require('async');
var util = require('util');

// Internal modules
var AppService = require(__CONFIG__.app_code_path + 'app-service.js');
var GetStatus = require(__CONFIG__.app_lib_path + 'status.js');
var ProductModel = require(__CONFIG__.app_code_path + 'product/product-model.js');

function ProductService(app) {
  AppService.call(this);
}

util.inherits(ProductService, AppService);

// To retrive all products list from the database
ProductService.prototype.getProducts = function (options, cb) {
  var mProducts = new ProductModel();
  mProducts.getProducts(options, cb);
};


//To insert a new product details into database
ProductService.prototype.insertProduct = function (options, cb) {
  var mProducts = new ProductModel();
  mProducts.insertProduct(options, cb);
};

//To remove a product from database
ProductService.prototype.removeProduct = function (options, cb) {
  var mProducts = new ProductModel();
  mProducts.removeProduct(options, cb);
};

//To update a product details in the  database
ProductService.prototype.updateProduct = function (options, cb) {
  var mProducts = new ProductModel();
  mProducts.updateProduct(options, cb);
};

module.exports = ProductService;
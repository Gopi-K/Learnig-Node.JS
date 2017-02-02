/* global __CONFIG__ */
'use strict';

// Third party modules
var fs = require('fs');
var async = require('async');
var util = require('util');
var i18n = require('i18n');
var __ = require('underscore');

// Internal modules
var AppModel = require(__CONFIG__.app_code_path + 'app-model.js');
var GetStatus = require(__CONFIG__.app_lib_path + 'status.js');
var AppError = require(__CONFIG__.app_lib_path + 'app-error');

function ShoppingCartModel(app) {
  AppModel.call(this);     
}

util.inherits(ShoppingCartModel, AppModel);

// To retrive all products list in the shopping Cart
ShoppingCartModel.prototype.getMyCart = function (options, cb) {
  var that = this;
  var sqlQuery = ' SELECT ' +
    ' sc.cart_item_id AS cartItemId , ' +
    ' sc.product_id AS productId , ' +
    ' p.product_name AS productName , ' +
    ' p.product_cost AS unitPrice , ' +
    ' sc.quantity AS quantity ' +
    ' FROM shopping_cart sc INNER JOIN all_products p ON sc.product_id = p.product_id;';
  this.getResults({
    query: sqlQuery,
    cb: function (err, queryResult) {
      if (!err && !queryResult) {
       err = new AppError(that.getStatusCode('notFound'),  __CONFIG__.api_response_messages.common_no_results_found_msg, {});
      }
      if (err) {
        return cb(err);
      }
      return cb(null, queryResult);
    }
  });
};


//To add products to the shopping Cart
ShoppingCartModel.prototype.addProductsToCart = function (options, cb) {
  if (__.isEmpty(options)) {
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('insert.shop-err-empty')));
  }
  if(!checkValuesType(options, "number")){
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('insert.shop-err-wrong-datatypes')));
  }
  var that = this;
  var sqlQuery = ' INSERT INTO ' +
    ' shopping_cart (product_id, quantity) ' +
    ' VALUES ';
  var finalObj = buildInsertQuery(options);
  sqlQuery += finalObj.sqlCondition;
  this.query({
    query: sqlQuery,
    data: finalObj.data,
    cb: function (err, queryResult) {
      if (!err && !queryResult) {
       err = new AppError(that.getStatusCode('notFound'),  __CONFIG__.api_response_messages.common_no_results_found_msg, {});
      }
      if (err) {
        return cb(err);
      }
      return cb(null, queryResult);
    }
  });
};

//To remove products from the Cart
ShoppingCartModel.prototype.removeProductsFromCart = function (options, cb) {
  if (__.isEmpty(options)) {
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('remove.shop-err-empty')));
  }
  if(typeof(options.cartItemId)!= "number"){
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('remove.shop-err-wrong-datatypes')));
  }
  var that = this;
  var sqlQuery = ' DELETE FROM ' +
    ' shopping_cart ' +
    ' WHERE cart_item_id = :cartItemId ';
  this.query({
    query: sqlQuery,
    data: options,
    cb: function (err, queryResult) {
      if (!err && !queryResult) {
       err = new AppError(that.getStatusCode('notFound'),  __CONFIG__.api_response_messages.common_no_results_found_msg, {});
      }
      if (err) {
        return cb(err);
      }
      return cb(null, queryResult);
    }
  });
};

//To update the quantities of products in the  Cart
ShoppingCartModel.prototype.updateQuantitiesInCart = function (options, cb) {
  if (__.isEmpty(options)) {
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('update.shop-err-empty')));
  }
  if(typeof(options.quantity)!= "number" || typeof(options.cartItemId)!= "number"){
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('update.shop-err-wrong-datatypes')));
  }
  var that = this;
  var sqlQuery = ' UPDATE shopping_cart ' +
    'SET quantity = :quantity'+
    ' WHERE cart_item_id = :cartItemId ';
  this.query({
    query: sqlQuery,
    data: options,
    cb: function (err, queryResult) {
      if (!err && !queryResult) {
       err = new AppError(that.getStatusCode('notFound'),  __CONFIG__.api_response_messages.common_no_results_found_msg, {});
      }
      if (err) {
        return cb(err);
      }
      return cb(null, queryResult);
    }
  });
};

// To get total cost of items in the shopping Cart
ShoppingCartModel.prototype.getTotalCost = function (options, cb) {
  var that = this;
  var sqlQuery = ' SELECT ' +
    ' sum(sc.quantity * p.product_cost) as Total ' +
    ' FROM shopping_cart sc INNER JOIN all_products p ON sc.product_id = p.product_id;';
  this.getResults({
    query: sqlQuery,
    cb: function (err, queryResult) {
      if (!err && !queryResult) {
       err = new AppError(that.getStatusCode('notFound'),  __CONFIG__.api_response_messages.common_no_results_found_msg, {});
      }
      if (err) {
        return cb(err);
      }
      return cb(null, queryResult);
    }
  });
};

// To save buyer details while checking out of cart
ShoppingCartModel.prototype.checkOutCart = function (options, cb) {
  if (__.isEmpty(options)) {
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('insert.shop-err-empty')));
  }
  if(typeof(options.name) != "string" || typeof(options.phonenumber) != "string" || 
     typeof(options.email) != "string" || typeof(options.gender) != "string"){
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('insert.shop-err-wrong-datatypes')));
  }
  var that = this;
  var sqlQuery = ' INSERT INTO ' +
    ' user_details (user_name, phone_number, email_id, gender) ' +
    ' VALUES (:name, :phonenumber, :email, :gender)';
  this.query({
    query: sqlQuery,
    data: options,
    cb: function (err, queryResult) {
      if (!err && !queryResult) {
       err = new AppError(that.getStatusCode('notFound'),  __CONFIG__.api_response_messages.common_no_results_found_msg, {});
      }
      if (err) {
        return cb(err);
      }
      return cb(null, queryResult);
    }
  });
};

// To get total sales of products from the shopping Cart
ShoppingCartModel.prototype.getTotalSales = function (options, cb) {
  var that = this;
  var sqlQuery = ' SELECT ' +
    ' p.product_name as ProductName, ' +
    ' sum(sc.quantity) as TotalSales ' +
    ' FROM shopping_cart sc INNER JOIN all_products p ON sc.product_id = p.product_id'+
    ' group by p.product_name';
  this.getResults({
    query: sqlQuery,
    cb: function (err, queryResult) {
      if (!err && !queryResult) {
       err = new AppError(that.getStatusCode('notFound'),  __CONFIG__.api_response_messages.common_no_results_found_msg, {});
      }
      if (err) {
        return cb(err);
      }
      return cb(null, queryResult);
    }
  });
};

//This method is used to build insert query, if multiple product details are there
function buildInsertQuery (options) {
  var finalData = [];
  var finalCols = [];
  for (var i = 0, len = options.length; i < len; ++i) {
    var dynamicCols = [];
    var currData = options[i];
    for (var prop in currData) {
      dynamicCols.push('?');
      finalData.push(currData[prop]);
    }
    finalCols.push('(' + dynamicCols.join(', ') + ')');
  }
  return {
    sqlCondition: finalCols.join(),
    data: finalData
  };
}

//This method takes array of object and a datatype as arguments and checks whether all the values are of that datatype or not
function checkValuesType(options, valueType){
  for(var i=0, len = options.length; i < len; i++){
    var currData = options[i];
    for(var prop in currData){
      if(typeof(currData[prop]) != valueType){
        return false;
      }
    }
  }
  return true;
}

module.exports = ShoppingCartModel;
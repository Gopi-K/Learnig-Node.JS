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

function ProductModel(app) {
  AppModel.call(this);     
}

util.inherits(ProductModel, AppModel);

// To retrive all products list from the database
ProductModel.prototype.getProducts = function (options, cb) {
  var that = this;
  var sqlQuery = ' SELECT ' +
    ' product_id AS productId , ' +
    ' product_name AS productName , ' +
    ' product_cost AS productCost ' +
    ' FROM all_products';
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


//To insert a new product details into database
ProductModel.prototype.insertProduct = function (options, cb) {
  if (__.isEmpty(options)) {
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('insert.shop-err-empty')));
  }
  if(!checkProductValuesTypes(options)){
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('insert.shop-err-wrong-datatypes')));
  }
  var that = this;
  var sqlQuery = ' INSERT INTO ' +
    ' all_products (product_name, product_cost) ' +
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

//To remove a product from database
ProductModel.prototype.removeProduct = function (options, cb) {
  if (__.isEmpty(options)) {
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('remove.shop-err-empty')));
  }
  if(typeof(options.id) != "number"){
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('remove.shop-err-wrong-datatypes')));
  }
  var that = this;
  var sqlQuery = ' DELETE FROM ' +
    ' all_products ' +
    ' WHERE product_id = :id ';
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

//To update a product details in the  database
ProductModel.prototype.updateProduct = function (options, cb) {
  if (__.isEmpty(options)) {
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('update.shop-err-empty')));
  }
  if(typeof(options.name) != "string" || typeof(options.cost) != "number" || typeof(options.id) != "number"){
    return cb(new AppError(this.getStatusCode('badRequest'), 
      i18n.__('update.shop-err-wrong-datatypes')));
  }
  var that = this;
  var sqlQuery = ' UPDATE ' +
    ' all_products ' +
    'SET product_name = :name,'+
    ' product_cost = :cost'+
    ' WHERE product_id = :id ';
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

//This method verifies the datatypes of product details that to be inserted into database
function checkProductValuesTypes(options){
  for(var i=0, len = options.length; i < len; i++){
    var currData = options[i];   
      if(typeof(currData.name) != "string" || typeof(currData.cost) != "number"){
        return false;
      } 
  }
  return true;
}

module.exports = ProductModel;
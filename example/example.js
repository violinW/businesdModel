'use strict';
const modelList = require("./modelList.js");
const knex = require('knex')({client: "mysql"});
const businessModel = require("../index.js")((knex, modelList));
const CommonUseCase = businessModel.CommonUseCase;
const dbName = "testDB";

module.exports = CommonUseCase(dbName, "Campaign", "type_two");


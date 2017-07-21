'use strict';
const CommonDataSource = require("./basicModel.js");
const BasicUseCase = require("./basicUseCase.js");
const dataType = require('./dispModel/dataType');
const dataStructure = require('./dispModel/dataStructure')(dataType);
module.exports = (knex, modelList)=> {
  const modelProcessor = require("./modelProcessor.js")(modelList || {});
  return {
    CommonUseCase: (dbName, modelName, modeName)=> {
      return BasicUseCase(knex)(dbName, modelProcessor(modelName).setMode(modeName), dataStructure);
    },
    CommonDataSource: CommonDataSource(knex),
    dataStructure: dataStructure,
    dataType: dataType
  }
};
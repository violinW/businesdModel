const businessModel = require("icrm-business-model")(knex, modelList);

const CommonUseCase = businessModel.CommonUseCase;

const CommonDataSource = businessModel.CommonDataSource；

modelList用于定义数据模型

knex为三方库实例化对象
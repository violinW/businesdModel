'use strict';
const _ = require('lodash');
const log4js = require('log4js');
const logger = log4js.getLogger();
const Promise = require('bluebird');
module.exports = (knex)=> {
  const basicModel = require('./basicModel')(knex);
  return (dbName, businessModel, dataStructure)=> {
    const mainColumns = (businessModel.dataStructure == "DEFAULT" ?
        "*" : dataStructure.getModel(businessModel.dataStructure).getColumnsList());

    let models = {
      main: basicModel(dbName, businessModel.TableName, {}),
      foreign: {},
      antiForeign: {},
      mapping: {}
    };

    _.each(businessModel.ForeignKey, (table)=> {
      models.foreign[`${table.Table}Model`] = basicModel(dbName, table.Table, {});
    });
    _.each(businessModel.AntiForeignKey, (table)=> {
      models.antiForeign[`${table.Table}Model`] = basicModel(dbName, table.Table, {});
    });
    _.each(businessModel.MappingKey, (table)=> {
      models.mapping[`${table.MiddleTable}Model`] = basicModel(dbName, table.MiddleTable, {});
    });
    return {
      /**
       * 获取全部数据列表(不包含外键关系)
       * @param orderby 排序字段
       * @param orderDesc 排序规则 desc或者asc
       * @returns {*}
       */
      getAllDataList(orderby, orderDesc){
        logger.trace("[BASIC USE CASE]enter getList");

        return models.main.getAllList(orderby, orderDesc, mainColumns)
            .then((result)=> {
              logger.debug(`[END BASIC USE CASE] ${businessModel.TableName} getAllDataList result:` + JSON.stringify(result));
              return result
            })
      },
      /**
       * 获取简单列表(不包含外键关系)
       * @param filter 字段筛选条件 例：{"sex": "male", "age": "18"}
       * @param keywords 关键字
       * @param keywordsField 关键字匹配字段
       * @param pagesize 单页数  据条数
       * @param page 当前查询页码
       * @param orderby 排序字段
       * @param orderDesc 排序规则 desc或者asc
       * @returns {*}
       */
      getList(filter, keywords, keywordsField, page, pagesize, orderby, orderDesc){
        logger.trace("[BASIC USE CASE]enter getList");

        return models.main.getSimpleList(filter, keywords, keywordsField, page, pagesize, orderby, orderDesc, mainColumns)
            .then((result)=> {
              logger.debug(`[END BASIC USE CASE] ${businessModel.TableName} getList result:` + JSON.stringify(result));
              return result
            })
      },
      /**
       * 查询某表数据及其外键、映射关系数据
       * @param filter 字段筛选条件 例：{"sex": "male", "age": "18"}
       * @param keywords 关键字
       * @param keywordsField 关键字匹配字段
       * @param pagesize 单页数据条数
       * @param page 当前查询页码
       * @param orderby 排序字段
       * @param orderDesc 排序规则 desc或者asc
       * @returns {Request}
       */
      getJoinList(filter, keywords, keywordsField, page, pagesize, orderby, orderDesc){
        logger.trace("[BASIC USE CASE]enter getJoinList");

        return models.main.getSimpleList(filter, keywords, keywordsField, page, pagesize, orderby, orderDesc, mainColumns)
            .then((mainData)=> {
              //查询所有外键关系数据
              if (businessModel.ForeignKey && businessModel.ForeignKey.length) {
                return Promise.map(mainData, (mainItem)=> {
                  return Promise.map(businessModel.ForeignKey, (table)=> {
                    let columns = (table.dataStructure == "DEFAULT" ?
                        "*" : dataStructure.getModel(table.dataStructure).getColumnsList());
                    return models.foreign[`${table.Table}Model`].getSimpleDetail(table.ForeignTableKey, mainItem[table.ThisTableKey], columns)
                        .then((list)=> {
                          mainItem[`${table.Table}List`] = list;
                        })
                  })
                })
                    .then(()=> {
                      return mainData;
                    });
              } else {
                return mainData;
              }
            })
            .then((mainData)=> {
              //查询所有反外键关系数据
              if (businessModel.AntiForeignKey && businessModel.AntiForeignKey.length) {
                return Promise.map(mainData, (mainItem)=> {
                  return Promise.map(businessModel.AntiForeignKey, (table)=> {
                    let columns = (table.dataStructure == "DEFAULT" ?
                        "*" : dataStructure.getModel(table.dataStructure).getColumnsList());
                    return models.antiForeign[`${table.Table}Model`].getSimpleDetail(table.MainTableKey, mainItem[table.ThisTableKey], columns)
                        .then((list)=> {
                          mainItem[`${table.Table}Info`] = list[0];
                        })
                  })
                })
                    .then(()=> {
                      return mainData;
                    });
              } else {
                return mainData;
              }
            })
            .then((mainData)=> {
              //查询所有映射关系数据
              if (businessModel.MappingKey && businessModel.MappingKey.length) {
                return Promise.map(mainData, (mainItem)=> {
                  return Promise.map(businessModel.MappingKey, (table)=> {
                    let columns = (table.dataStructure == "DEFAULT" ?
                        "*" : dataStructure.getModel(table.dataStructure).getColumnsList());
                    return models.mapping[`${table.MiddleTable}Model`].getDetailWithMappingTable(table.MiddleKey,
                        mainItem[table.ThisTableKey], table.MappingTable, table.MappingKey, table.MappingTableKey, columns)
                        .then((list)=> {
                          mainItem[`${table.MiddleTable}List`] = list;
                        })
                  })
                })
                    .then(()=> {
                      return mainData;
                    });
              } else {
                return mainData;
              }
            })
            .then((mainData)=> {
              logger.debug(`[END BASIC USE CASE] ${businessModel.TableName} getJoinList result:` + JSON.stringify(mainData));
              return mainData
            })
      },
      /**
       * 获取联表详情
       * @param Id 详情Id
       * @returns {Request}
       */
      getJoinDetail(Id){
        logger.trace("[BASIC USE CASE]enter getJoinDetail");

        return models.main.getSimpleDetail(businessModel.UniqueKey, Id, mainColumns)
            .then((mainData)=> {
              const detail = mainData[0];
              //查询所有外键关系数据
              if (businessModel.ForeignKey && businessModel.ForeignKey.length) {
                return Promise.map(businessModel.ForeignKey, (table)=> {
                  return models.foreign[`${table.Table}Model`].getSimpleDetail(table.ForeignTableKey, detail[table.ThisTableKey])
                      .then((list)=> {
                        detail[`${table.Table}List`] = list;
                        return;
                      })
                })
              } else {
                return detail;
              }
            })
            .then((detail)=> {
              //查询所有反外键关系数据
              if (businessModel.AntiForeignKey && businessModel.AntiForeignKey.length) {
                return Promise.map(businessModel.AntiForeignKey, (table)=> {
                  return models.antiForeign[`${table.Table}Model`].getSimpleDetail(table.MainTableKey, detail[table.ThisTableKey])
                      .then((list)=> {
                        detail[`${table.Table}Info`] = list[0];
                        return;
                      })
                })
                    .then((result)=> {
                      return detail;
                    })
              } else {
                return detail;
              }
            })
            .then((detail)=> {
              logger.debug(detail);
              //查询所有映射关系数据
              if (businessModel.MappingKey && businessModel.MappingKey.length) {
                logger.debug(businessModel.MappingKey)
                return Promise.map(businessModel.MappingKey, (table)=> {
                  logger.debug(table)
                  return models.mapping[`${table.MiddleTable}Model`].getDetailWithMappingTable(table.MiddleKey,
                      detail[table.ThisTableKey], table.MappingTable, table.MappingKey, table.MappingTableKey)
                      .then((list)=> {
                        detail[`${table.MiddleTable}List`] = list;
                      })
                      .then(()=> {
                        return detail;
                      });
                })
              } else {
                return detail;
              }
            })
            .then((detail)=> {
              logger.debug(`[END BASIC USE CASE] ${businessModel.TableName} getJoinList result:` + JSON.stringify(detail));
              return detail
            })

      },
      /**
       * 获取简单详情
       * @param fieldName 查询字段
       * @param Id 查询Id
       * @returns {*|Promise.<T>|Request}
       */
      getSimpleDetail(fieldName, Id){
        logger.trace("[BASIC USE CASE]enter getSimpleDetail");

        return models.main.getSimpleDetail(fieldName, Id, mainColumns)
            .then((result)=> {
              logger.debug(`[END BASIC USE CASE] ${businessModel.TableName} getSimpleDetail result:` + JSON.stringify(result));
              return result
            })
      },
      /**
       * 通过Id获取某条数据某个字段值
       * @param Id 数据Id
       * @param FieldName 字段名称
       * @returns {*|Promise.<T>|Request}
       */
      getFieldById(Id, FieldName){
        logger.trace("[BASIC USE CASE]enter getFieldById");

        return models.main.getFieldListByCondition(businessModel.UniqueKey, Id, FieldName)
            .then((result)=> {
              logger.debug(`[END BASIC USE CASE] ${businessModel.TableName} getCampaignFieldById result:` + JSON.stringify(result));
              return result
            })
      },
      /**
       * 添加简单列表
       * @param data 列表数据[Array]
       * @returns {*}
       */
      addSimpleList(data){
        logger.trace("[BASIC USE CASE]enter addSimpleList");

        return models.main.addData(data);
      },
      /**
       * 添加联表数据
       * @param data 需要编辑的数据
       * 示范数据：{
     *    mainData：{},    请用【mainData】来作为主表数据名称
     *    limitTimeDiscountModel:[{}],      请用【表名+Model】来作为外键表数据名称
     *    campaignTargetModel:[{}]
     * }
       * @returns {*}
       */
      addJoinData(data){
        logger.trace("[BASIC USE CASE]enter addJoinData");

        return knex.transaction((trx)=> {
          models.main.addData(data && data.mainData, trx)
              .then((results)=> {
                const id = results[0];
                return Promise.all([
                  Promise.map(businessModel.MappingKey, (table)=> {
                    let newData = data[`${table.MiddleTable}Data`];
                    _.each(newData, (item)=> {
                      item[table.MiddleKey] = id;
                    });
                    return models.mapping[`${table.MiddleTable}Model`].addData(newData, trx)
                  }),
                  Promise.map(businessModel.ForeignKey, (table)=> {
                    let newData = data[`${table.Table}Data`];
                    _.each(newData, (item)=> {
                      item[table.ForeignTableKey] = id;
                    });
                    logger.debug(newData);
                    return models.foreign[`${table.Table}Model`].addData(newData, trx)
                  }),
                  Promise.map(businessModel.AntiForeignKey, (table)=> {
                    let newData = data[`${table.Table}Data`];
                    _.each(newData, (item)=> {
                      item[table.MainTableKey] = data.mainData[`${table.Table}_id`];
                    });
                    logger.debug(newData);
                    return models.antiForeign[`${table.Table}Model`].addData(newData, trx)
                  })
                ])
                    .then((result)=> {
                      logger.trace(result);
                      return result;
                    })
              })
              .then(trx.commit)
              .catch(trx.rollback);
        })
      },
      /**
       * 更新简单数据
       * @param Id 数据Id
       * @param data 更新的数据
       * @returns {*}
       */
      putSimpleData(Id, data){
        logger.trace("[BASIC USE CASE]enter putSimpleData");

        return models.main.updateData(data, businessModel.UniqueKey, Id);
      },
      /**
       * 更新联表数据
       * @param Id 数据Id
       * @param data 更新的数据
       * 示范数据：{
     *    mainData：{},    请用【mainData】来作为主表数据名称
     *    limitTimeDiscountModel:[{}],      请用【表名+Model】来作为外键表数据名称
     *    campaignTargetModel:[{}]
     * }
       * @returns {*}
       */
      putJoinData(Id, data){
        logger.trace("[BASIC USE CASE]enter putJoinData");

        return knex.transaction((trx)=> {
          Promise.all([
            //更新 Campaign 数据
            models.main.updateData(data && data.mainData, "Id", Id, trx),
            Promise.map(businessModel.ForeignKey, (table)=> {
              return Promise.all([
                models.foreign[`${table.Table}Model`].deleteData(table.ForeignTableKey, Id, trx),
                models.foreign[`${table.Table}Model`].addData(data[`${table.MiddleTable}Data`], trx)
              ])
            }),
            Promise.map(businessModel.MappingKey, (table)=> {
              return Promise.all([
                models.mapping[`${table.MiddleTable}Model`].deleteData(table.MiddleKey, Id, trx),
                models.mapping[`${table.MiddleTable}Model`].addData(data[`${table.MiddleTable}Data`], trx)
              ])
            }),
            Promise.map(businessModel.AntiForeignKey, (table)=> {
              return models.antiForeign[`${table.Table}Model`].deleteData(table.MainTableKey, data.mainData[`${table.Table}_id`], trx)
                  .then(()=>{
                    let newData = data[`${table.Table}Data`];
                    _.each(newData, (item)=> {
                      item[table.MainTableKey] = data.mainData[`${table.Table}_id`];
                    });
                    logger.debug(newData);
                    return models.antiForeign[`${table.Table}Model`].addData(newData, trx)
                  })
            })
          ])
              .then(trx.commit)
              .catch(trx.rollback);
        })
      },
      /**
       * 更新简单列表
       * @param data 更新的数据
       * @returns {*}
       */
      putSimpleList(data){
        logger.trace("[BASIC USE CASE]enter putSimpleList");

        return knex.transaction((trx)=> {
          return Promise.map(data, function (item) {
            return models.main.updateData(item, businessModel.UniqueKey, item[businessModel.UniqueKey], trx)
          });
        })
      },
      /**
       * 根据Id删除数据
       * @param Id 数据Id
       * @returns {*}
       */
      deleteById(Id, trx){
        logger.trace("[BASIC USE CASE]enter deleteById");

        if (trx) {
          return Promise.all([
            //删除 Campaign 数据
            models.main.deleteData(businessModel.UniqueKey, Id, trx),
            Promise.map(businessModel.ForeignKey, function (table) {
              return models.foreign[`${table.Table}Model`].deleteData(table.ForeignTableKey, Id, trx)
            }),
            Promise.map(businessModel.MappingKey, (table)=> {
              return models.mapping[`${table.MiddleTable}Model`].deleteData(table.MiddleKey, Id, trx)
            })
          ])
        } else {
          return knex.transaction((trxx)=> {
            Promise.all([
              //删除 Campaign 数据
              models.main.deleteData(businessModel.UniqueKey, Id, trxx),
              Promise.map(businessModel.ForeignKey, function (table) {
                return models.foreign[`${table.Table}Model`].deleteData(table.ForeignTableKey, Id, trxx)
              }),
              Promise.map(businessModel.MappingKey, (table)=> {
                return models.mapping[`${table.MiddleTable}Model`].deleteData(table.MiddleKey, Id, trxx)
              })
            ])
                .then(trxx.commit)
                .catch(trxx.rollback);
          })
        }
      },
      /**
       * 根据字段删除数据
       * @param fieldName 字段名称
       * @param value 字段内容
       * @returns {*}
       */
      deleteByField(fieldName, value, trx){
        logger.trace("[BASIC USE CASE]enter deleteById");

        return models.main.deleteData(fieldName, value, trx);
      }
    }
  }
}
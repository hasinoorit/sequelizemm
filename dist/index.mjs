import fs from 'fs/promises';
import prompts from 'prompts';
import chalk from 'chalk';

const convertReference = (ref) => {
  return { table: ref.model, field: ref.key };
};
const getTableName = (model) => {
  return model.modelDefinition?.table?.tableName || model.tableName;
};
const genDefaultValue = (val) => {
  if (typeof val === "object" && ["NOW", "UUID1", "UUID4"].includes(val.constructor.name)) {
    return `%%Sequelize.DataTypes.${val.constructor.name}%%`;
  }
  return val;
};
const genDataType = (type) => {
  const _name = type.constructor.name === "JSONTYPE" ? "JSON" : type.constructor.name;
  const jsonType = {};
  if (type.options) {
    jsonType.options = JSON.parse(JSON.stringify(type.options));
  }
  const _rt = { type: _name };
  if (jsonType.options) {
    _rt.options = jsonType.options;
    if (_name === "ARRAY") {
      _rt.itemType = genDataType(type.type);
    }
  }
  return _rt;
};
const dataTypeToString = (type) => {
  if (type.type === "ENUM") {
    return `%%Sequelize.DataTypes.ENUM("${type.options.values.join('","')}")%%`;
  }
  if (type.type === "ARRAY") {
    return `%%Sequelize.DataTypes.ARRAY(${dataTypeToString(type.itemType).replaceAll(
      "%%",
      ""
    )})%%`;
  }
  if (type.options && Object.keys(type.options).length > 0) {
    return `%%Sequelize.DataTypes.${type.type}(${JSON.stringify(type.options)})%%`;
  }
  return `%%Sequelize.DataTypes.${type.type}%%`;
};
const generateFKC = (field, tableName) => {
  if (field.references) {
    return {
      fields: [field.field],
      type: "foreign key",
      name: `${tableName}_${field.field}_fkey`,
      references: convertReference(field.references),
      onDelete: field.onDelete,
      onUpdate: field.onUpdate,
      tableName
    };
  }
  return null;
};
const generateUKC = (uniqueKeys, tableName) => {
  const uKeys = {};
  Object.keys(uniqueKeys).forEach((key) => {
    const keyItem = uniqueKeys[key];
    uKeys[key] = {
      fields: keyItem.fields,
      name: key,
      table: tableName
    };
  });
  return uKeys;
};
const generateIndexes = (indexes, tableName) => {
  const idx = {};
  indexes.forEach((index) => {
    idx[index.name] = {
      tableName,
      name: index.name,
      type: index.type,
      using: index.using,
      operator: index.operator,
      unique: index.unique,
      concurrently: index.concurrently,
      fields: index.fields
    };
  });
  return idx;
};
const generateField = (_field, fieldName, modelName) => {
  if (_field.type.constructor.name === "VIRTUAL")
    return null;
  const field = { fieldName, type: genDataType(_field.type) };
  if (_field.allowNull === false) {
    field.allowNull = false;
  }
  if (_field.primaryKey) {
    field.primaryKey = _field.primaryKey;
  }
  if (_field.autoIncrement) {
    field.autoIncrement = true;
  }
  if (_field.field) {
    field.field = _field.field;
  }
  if (_field.unique) {
    field.unique = _field.unique;
  }
  if (_field.defaultValue) {
    field.defaultValue = genDefaultValue(_field.defaultValue);
  }
  return field;
};
const generateModel = (_model, modelName) => {
  const model = {
    modelName,
    tableName: getTableName(_model),
    fields: {}
  };
  const fkeyCs = {};
  const _fields = _model.getAttributes();
  const fieldNames = Object.keys(_fields);
  for (let index = 0; index < fieldNames.length; index++) {
    const fieldName = fieldNames[index];
    const _field = _fields[fieldName];
    const field = generateField(_field, fieldName);
    if (field) {
      model.fields[field.field] = field;
    }
    const fKeyC = generateFKC(_field, getTableName(_model));
    if (fKeyC) {
      fkeyCs[fKeyC.name] = fKeyC;
    }
  }
  return {
    model,
    fKeyConstraints: fkeyCs,
    uKeyConstraints: generateUKC(_model.uniqueKeys, getTableName(model)),
    indexes: generateIndexes(_model._indexes, getTableName(model))
  };
};

const currentSchema = (db) => {
  const models = {};
  const fKeyConstraints = {};
  const uKeyConstraints = {};
  const indexes = {};
  const modelNames = Object.keys(db.models);
  for (let mIndex = 0; mIndex < modelNames.length; mIndex++) {
    const modelName = modelNames[mIndex];
    const _model = db.model(modelName);
    const modelWithFkeys = generateModel(_model, modelName);
    models[modelName] = modelWithFkeys.model;
    Object.assign(fKeyConstraints, modelWithFkeys.fKeyConstraints);
    Object.assign(uKeyConstraints, modelWithFkeys.uKeyConstraints);
    Object.assign(indexes, modelWithFkeys.indexes);
  }
  return { models, fKeyConstraints, uKeyConstraints, indexes };
};

const createTableQI = (model) => {
  const fields = {};
  Object.keys(model.fields).forEach((attr) => {
    const field = model.fields[attr];
    fields[attr] = { ...field, type: dataTypeToString(model.fields[attr].type) };
    if (field.defaultValue) {
      fields[attr].defaultValue = genDefaultValue(field.defaultValue);
    }
    delete fields[attr].fieldName;
  });
  return `await queryInterface.createTable('${model.tableName}', ${JSON.stringify(
    fields
  )}, {transaction});`;
};
const renameTableQI = (before, current) => {
  return `await queryInterface.renameTable('${before}','${current}', {transaction});`;
};
const dropTableQI = (model) => {
  return `await queryInterface.dropTable('${model.tableName}', {transaction});`;
};
const addColumnQI = (tableName, field) => {
  const attribute = { ...field, type: dataTypeToString(field.type) };
  if (field.field) {
    delete attribute.field;
  }
  delete attribute.fieldName;
  if (field.defaultValue) {
    attribute.defaultValue = genDefaultValue(field.defaultValue);
  }
  return `await queryInterface.addColumn('${tableName}', '${field.field}',${JSON.stringify(attribute)}, {transaction});`;
};
const renameColumnQI = (tableName, oldField, newField) => {
  return `await queryInterface.renameColumn('${tableName}', '${oldField.field}','${newField.field}', {transaction});`;
};
const changeColumnQI = (tableName, field) => {
  const attribute = { ...field, type: dataTypeToString(field.type) };
  if (field.field) {
    delete attribute.field;
  }
  delete attribute.fieldName;
  if (field.defaultValue) {
    attribute.defaultValue = genDefaultValue(field.defaultValue);
  }
  return `await queryInterface.changeColumn('${tableName}', '${field.field}',${JSON.stringify(attribute)}, {transaction});`;
};
const removeColumnQI = (tableName, field) => {
  return `await queryInterface.removeColumn('${tableName}', '${field.field}', {transaction});`;
};
const addIndexQI = (index) => {
  const opt = {
    fields: index.fields,
    concurrently: index.concurrently,
    unique: index.unique,
    using: index.using,
    operator: index.operator,
    type: index.type,
    name: index.name
  };
  return `await queryInterface.addIndex('${index.tableName}', ${JSON.stringify(
    opt
  )}, {transaction});`;
};
const removeIndexQI = (index) => {
  return `await queryInterface.removeIndex('${index.tableName}', '${index.name}', {transaction});`;
};
const addUniqueConstraintQI = (uniqueKey) => {
  const opt = { fields: uniqueKey.fields, name: uniqueKey.name, type: "unique" };
  return `await queryInterface.addConstraint('${uniqueKey.table}', ${JSON.stringify(
    opt
  )}, {transaction});`;
};
const removeUniqueConstraintQI = (uniqueKey) => {
  return `await queryInterface.removeConstraint('${uniqueKey.table}', '${uniqueKey.name}', {transaction});`;
};
const addFKConstraintQI = (fKey) => {
  const opt = { ...fKey };
  if (fKey.tableName) {
    delete opt.tableName;
  }
  return `await queryInterface.addConstraint('${fKey.tableName}', ${JSON.stringify(
    opt
  )}, {transaction});`;
};
const removeFKConstraintQI = (fKey) => {
  return `await queryInterface.removeConstraint('${fKey.tableName}', '${fKey.name}', {transaction});`;
};

const equalUnique = (c, o) => {
  let cArg = c;
  let oArg = o;
  if (typeof c === "object" && c !== null && "arg" in c) {
    console.log(c);
    cArg = c.arg;
  }
  if (typeof o === "object" && o !== null && "arg" in o) {
    oArg = o.arg;
  }
  return cArg === oArg;
};
const compareModel = async (current, old, upMig, downMig) => {
  const missingFields = {};
  const newFields = {};
  if (current.tableName !== old.tableName) {
    upMig.push(renameTableQI(old.tableName, current.tableName));
    downMig.push(renameTableQI(current.tableName, old.tableName));
  }
  Object.keys(old.fields).forEach((key) => {
    const cField = current.fields[key];
    if (!cField) {
      missingFields[key] = old.fields[key];
    } else {
      const oField = old.fields[key];
      if (cField.field !== oField.field) {
        upMig.push(renameColumnQI(current.tableName, oField, cField));
        downMig.push(renameColumnQI(current.tableName, cField, oField));
      }
      if (cField.allowNull !== oField.allowNull || cField.autoIncrement !== oField.autoIncrement || cField.defaultValue !== oField.defaultValue || cField.primaryKey !== oField.primaryKey || JSON.stringify(cField.type) !== JSON.stringify(oField.type) || !equalUnique(cField.unique, oField.unique)) {
        upMig.push(changeColumnQI(current.tableName, cField));
        downMig.push(changeColumnQI(old.tableName, oField));
      }
    }
  });
  for (const [key, value] of Object.entries(current.fields)) {
    const field = value.field;
    if (!old.fields[field] || !old.fields[field]) {
      newFields[field] = current.fields[field];
    }
  }
  const missingFieldsKeys = Object.keys(missingFields);
  for (let index = 0; index < missingFieldsKeys.length; index++) {
    const fieldName = missingFieldsKeys[index];
    const { ans } = await prompts({
      name: "ans",
      type: "confirm",
      message: `${chalk.green(fieldName)} is missing in ${chalk.green(
        old.modelName
      )} model. Have you deleted it?`
    });
    if (ans) {
      upMig.push(removeColumnQI(old.tableName, missingFields[fieldName]));
      downMig.push(addColumnQI(old.tableName, missingFields[fieldName]));
      delete missingFields[fieldName];
    } else {
      const { newField } = await prompts({
        name: "newField",
        type: "select",
        message: `Select current field for ${chalk.bold.bgBlack.green(
          fieldName
        )} Field`,
        choices: Object.entries(newFields).map(([key, value]) => ({
          title: value.fieldName,
          value: value.field
        }))
      });
      const cField = newFields[newField];
      const oField = missingFields[fieldName];
      if (cField.field !== oField.field) {
        upMig.push(renameColumnQI(current.tableName, oField, cField));
        downMig.push(renameColumnQI(current.tableName, cField, oField));
      }
      if (cField.allowNull !== oField.allowNull || cField.autoIncrement !== oField.autoIncrement || cField.defaultValue !== oField.defaultValue || cField.primaryKey !== oField.primaryKey || JSON.stringify(cField.type) !== JSON.stringify(oField.type) || !equalUnique(cField.unique, oField.unique)) {
        upMig.push(changeColumnQI(current.tableName, cField));
        downMig.push(changeColumnQI(old.tableName, oField));
      }
      delete missingFields[fieldName];
      delete newFields[newField];
    }
  }
  Object.keys(newFields).forEach((fieldName) => {
    upMig.push(addColumnQI(current.tableName, newFields[fieldName]));
    downMig.push(removeColumnQI(current.tableName, newFields[fieldName]));
  });
  return true;
};

const compareSchema = async (current, old = {
  fKeyConstraints: {},
  models: {},
  uKeyConstraints: {},
  indexes: {}
}) => {
  const saveCurrent = JSON.stringify(current);
  const upQI = [];
  const downQI = [];
  const missingModels = {};
  const newModels = {};
  const oldModelKeys = Object.keys(old.models);
  for (let index = 0; index < oldModelKeys.length; index++) {
    const modelName = oldModelKeys[index];
    if (!current.models[modelName]) {
      missingModels[modelName] = old.models[modelName];
      delete old.models[modelName];
    } else {
      if (JSON.stringify(current.models[modelName]) !== JSON.stringify(old.models[modelName])) {
        await compareModel(
          current.models[modelName],
          old.models[modelName],
          upQI,
          downQI
        );
      }
    }
  }
  Object.keys(current.models).forEach(async (modelName) => {
    if (!old.models[modelName]) {
      newModels[modelName] = current.models[modelName];
      delete current.models[modelName];
    }
  });
  const missingModelKeys = Object.keys(missingModels);
  for (let i = 0; i < missingModelKeys.length; i++) {
    const modelName = missingModelKeys[i];
    const { ans } = await prompts({
      name: "ans",
      type: "confirm",
      message: `${modelName} is missing in current schema. Have you deleted it?`
    });
    if (ans) {
      upQI.push(dropTableQI(missingModels[modelName]));
      downQI.push(createTableQI(missingModels[modelName]));
      delete missingModels[modelName];
    } else {
      const { newModel } = await prompts({
        name: "newModel",
        type: "select",
        message: `Select current model for ${modelName} model`,
        choices: Object.keys(newModels).map((n) => ({ title: n, value: n }))
      });
      await compareModel(newModels[newModel], missingModels[modelName], upQI, downQI);
      delete missingModels[modelName];
      delete newModels[newModel];
    }
  }
  Object.keys(newModels).forEach((modelName) => {
    upQI.push(createTableQI(newModels[modelName]));
    downQI.push(dropTableQI(newModels[modelName]));
  });
  const upConstraint = [];
  const downConstraint = [];
  Object.keys(old.fKeyConstraints).forEach((key) => {
    if (!current.fKeyConstraints[key]) {
      upConstraint.push(removeFKConstraintQI(old.fKeyConstraints[key]));
      downConstraint.push(addFKConstraintQI(old.fKeyConstraints[key]));
    }
  });
  Object.keys(current.fKeyConstraints).forEach((key) => {
    if (!old.fKeyConstraints[key]) {
      upConstraint.push(addFKConstraintQI(current.fKeyConstraints[key]));
      downConstraint.push(removeFKConstraintQI(current.fKeyConstraints[key]));
    }
  });
  Object.keys(old.uKeyConstraints).forEach((key) => {
    if (!current.uKeyConstraints[key]) {
      upConstraint.push(removeUniqueConstraintQI(old.uKeyConstraints[key]));
      downConstraint.push(addUniqueConstraintQI(old.uKeyConstraints[key]));
    }
  });
  Object.keys(current.uKeyConstraints).forEach((key) => {
    if (!old.uKeyConstraints[key]) {
      upConstraint.push(addUniqueConstraintQI(current.uKeyConstraints[key]));
      downConstraint.push(removeUniqueConstraintQI(current.uKeyConstraints[key]));
    }
  });
  const upIndex = [];
  const downIndex = [];
  Object.keys(old.indexes).forEach((key) => {
    if (!current.indexes[key]) {
      upIndex.push(removeIndexQI(old.indexes[key]));
      downIndex.push(addIndexQI(old.indexes[key]));
    }
  });
  Object.keys(current.indexes).forEach((key) => {
    if (!old.indexes[key]) {
      upIndex.push(addIndexQI(current.indexes[key]));
      downIndex.push(removeIndexQI(current.indexes[key]));
    }
  });
  const script = `module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${upQI.join("")}
    })
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${upConstraint.join("")}
    })
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${upIndex.join("")}
    })
  },down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${downConstraint.join("")}
    })
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${downQI.join("")}
    })
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${downIndex.join("")}
    })
  },
};`;
  const { migName } = await prompts({
    name: "migName",
    type: "text",
    message: `Enter migration name`
  });
  const date = /* @__PURE__ */ new Date();
  const name = `${date.getUTCFullYear()}${date.getUTCMonth().toString().padStart(2, "0")}${date.getUTCDate().toString().padStart(2, "0")}${date.getUTCHours().toString().padStart(2, "0")}${date.getUTCMinutes().toString().padStart(2, "0")}${date.getUTCSeconds().toString().padStart(2, "0")}-${migName}`;
  await fs.writeFile(
    `./migrations/${name}.js`,
    script.replaceAll(`"%%`, "").replaceAll(`%%"`, "").replaceAll("\\", "")
  );
  await fs.writeFile(`./migrations/schema.json`, saveCurrent);
};

const makemigration = async (db, oldSchema) => {
  const current = currentSchema(db);
  if (oldSchema) {
    await compareSchema(current, oldSchema);
  } else {
    await compareSchema(current);
  }
};

export { makemigration };

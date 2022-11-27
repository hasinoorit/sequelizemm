import type {
  QueryInterfaceOptions,
  QueryInterfaceIndexOptions,
  AddConstraintOptions,
} from "sequelize"
import type { Field, Model, FKeyConstraint, uniqueKey } from "./types"
import { dataTypeToString, genDefaultValue } from "./utils.js"

export const createTableQI = (model: Model) => {
  const fields: any = {}
  Object.keys(model.fields).forEach((attr) => {
    const field = model.fields[attr]
    fields[attr] = { ...field, type: dataTypeToString(model.fields[attr].type) }
    if (field.defaultValue) {
      fields[attr].defaultValue = genDefaultValue(field.defaultValue)
    }
    delete fields[attr].fieldName
  })
  return `await queryInterface.createTable('${model.tableName}', ${JSON.stringify(
    fields
  )}, {transaction});`
}

export const renameTableQI = (before: string, current: string) => {
  return `await queryInterface.renameTable('${before}','${current}', {transaction});`
}

export const dropTableQI = (model: Model) => {
  return `await queryInterface.dropTable('${model.tableName}', {transaction});`
}

export const addColumnQI = (tableName: string, field: Field) => {
  const attribute: any = { ...field, type: dataTypeToString(field.type) }
  if (field.field) {
    delete attribute.field
  }
  delete attribute.fieldName
  if (field.defaultValue) {
    attribute.defaultValue = genDefaultValue(field.defaultValue)
  }
  return `await queryInterface.addColumn('${tableName}', '${
    field.field
  }',${JSON.stringify(attribute)}, {transaction});`
}

export const renameColumnQI = (tableName: string, oldField: Field, newField: Field) => {
  return `await queryInterface.renameColumn('${tableName}', '${oldField.field}','${newField.field}', {transaction});`
}

export const changeColumnQI = (tableName: string, field: Field) => {
  const attribute: any = { ...field, type: dataTypeToString(field.type) }
  if (field.field) {
    delete attribute.field
  }
  delete attribute.fieldName
  if (field.defaultValue) {
    attribute.defaultValue = genDefaultValue(field.defaultValue)
  }
  return `await queryInterface.changeColumn('${tableName}', '${
    field.field
  }',${JSON.stringify(attribute)}, {transaction});`
}

export const removeColumnQI = (tableName: string, field: Field) => {
  return `await queryInterface.removeColumn('${tableName}', '${field.field}', {transaction});`
}

export const addIndexQI = (
  tableName: string,
  attributes: string[],
  options: QueryInterfaceIndexOptions
) => {}

export const removeIndexQI = (
  tableName: string,
  indexName: string,
  options?: QueryInterfaceIndexOptions
) => {}

export const addConstraintQI = (
  tableName: string,
  options?: AddConstraintOptions & QueryInterfaceOptions
) => {}

export const addUniqueConstraintQI = (uniqueKey: uniqueKey) => {
  const opt = { fields: uniqueKey.fields, name: uniqueKey.name, type: "unique" }
  return `await queryInterface.addConstraint('${uniqueKey.table}', ${JSON.stringify(
    opt
  )}, {transaction});`
}
export const removeUniqueConstraintQI = (uniqueKey: uniqueKey) => {
  return `await queryInterface.removeConstraint('${uniqueKey.table}', '${uniqueKey.name}', {transaction});`
}
export const addFKConstraintQI = (fKey: FKeyConstraint) => {
  const opt: any = { ...fKey }
  if (fKey.tableName) {
    delete opt.tableName
  }
  return `await queryInterface.addConstraint('${fKey.tableName}', ${JSON.stringify(
    opt
  )}, {transaction});`
}
export const removeFKConstraintQI = (fKey: FKeyConstraint) => {
  return `await queryInterface.removeConstraint('${fKey.tableName}', '${fKey.name}', {transaction});`
}

export const removeConstraintQI = (
  tableName: string,
  constraintName: string,
  options?: QueryInterfaceOptions
) => {}

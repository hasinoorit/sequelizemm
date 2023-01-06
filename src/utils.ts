import Sequelize from "sequelize"
import { Model, Field, FKeyConstraint, FKeyConstraints, UKeyConstraints } from "./types"

export const convertReference = (ref: any) => {
  return { table: ref.model as string, field: ref.key as string }
}

export const genDefaultValue = (val: any) => {
  if (
    typeof val === "object" &&
    ["NOW", "UUID1", "UUID4"].includes(val.constructor.name)
  ) {
    return `%%Sequelize.DataTypes.${val.constructor.name}%%`
  }
  return val
}

export const genDataType = (type: Sequelize.DataType & any) => {
  const _name = type.constructor.name === "JSONTYPE" ? "JSON" : type.constructor.name
  // let options = ""
  const jsonType = JSON.parse(JSON.stringify(type))
  // if (_name === "ENUM") {
  //   const { values } = JSON.parse(JSON.stringify(type))
  //   options = `('${values.join("','")}')`
  // } else if (jsonType.options && Object.keys(jsonType.options).length > 0) {
  //   options = `(${JSON.stringify(jsonType.options)})`
  // }
  const _rt: { type: string; options?: any; itemType?: any } = { type: _name }
  if (jsonType.options) {
    _rt.options = jsonType.options
    if (_name === "ARRAY") {
      _rt.itemType = genDataType(type.type)
    }
  }
  return _rt
}

export const dataTypeToString = (type: {
  type: string
  options?: any
  itemType?: any
}): string => {
  if (type.type === "ENUM") {
    return `%%Sequelize.DataTypes.ENUM("${type.options.values.join('","')}")%%`
  }
  if (type.type === "ARRAY") {
    return `%%Sequelize.DataTypes.ARRAY(${dataTypeToString(type.itemType).replaceAll(
      "%%",
      ""
    )})%%`
  }
  if (type.options && Object.keys(type.options).length > 0) {
    return `%%Sequelize.DataTypes.${type.type}(${JSON.stringify(type.options)})%%`
  }
  return `%%Sequelize.DataTypes.${type.type}%%`
}

export const fieldToAttr = (field: Field) => {
  const attr = { type: dataTypeToString(field.type) }
}

const generateFKC = (
  field: Sequelize.ModelAttributeColumnOptions<Sequelize.Model<any, any>>,
  tableName: string
): FKeyConstraint | null => {
  if (field.references) {
    return {
      fields: [field.field as string],
      type: "foreign key",
      name: `${tableName}_${field.field}_fkey`,
      references: convertReference(field.references),
      onDelete: field.onDelete,
      onUpdate: field.onUpdate,
      tableName,
    }
  }
  return null
}
const generateUKC = (uniqueKeys: any, tableName: string): UKeyConstraints | null => {
  const uKeys: UKeyConstraints = {}
  Object.keys(uniqueKeys).forEach((key) => {
    const keyItem = uniqueKeys[key]
    uKeys[key] = {
      fields: keyItem.fields,
      name: key,
      table: tableName,
    }
  })
  return uKeys
}

const generateField = (
  _field: Sequelize.ModelAttributeColumnOptions<Sequelize.Model<any, any>>,
  fieldName: string,
  modelName: string
): Field | null => {
  if (_field.type.constructor.name === "VIRTUAL") return null
  const field: Field = { fieldName, type: genDataType(_field.type) }
  if (_field.allowNull === false) {
    field.allowNull = false
  }
  if (_field.primaryKey) {
    field.primaryKey = _field.primaryKey
  }
  if (_field.autoIncrement) {
    field.autoIncrement = true
  }
  if (_field.field) {
    field.field = _field.field
  }
  if (_field.unique) {
    field.unique = _field.unique
  }
  if (_field.defaultValue) {
    field.defaultValue = genDefaultValue(_field.defaultValue)
  }
  return field
}

export const generateModel = (
  _model: Sequelize.ModelStatic<Sequelize.Model> & any,
  modelName: string
) => {
  const model: Model = {
    modelName: modelName,
    tableName: _model.tableName,
    fields: {},
  }
  const fkeyCs: FKeyConstraints = {}
  const _fields = _model.getAttributes()
  const fieldNames = Object.keys(_fields)
  for (let index = 0; index < fieldNames.length; index++) {
    const fieldName = fieldNames[index]
    const _field = _fields[fieldName]
    const field = generateField(_field, fieldName, modelName)
    if (field) {
      model.fields[field.field!] = field
    }
    const fKeyC = generateFKC(_field, _model.tableName)
    if (fKeyC) {
      fkeyCs[fKeyC.name] = fKeyC
    }
  }
  return {
    model,
    fKeyConstraints: fkeyCs,
    uKeyConstraints: generateUKC(_model.uniqueKeys, model.tableName),
  }
}

export interface FieldType {
  type: string
  options?: any
}

export interface Field {
  type: FieldType
  allowNull?: boolean
  primaryKey?: boolean | string
  autoIncrement?: boolean
  defaultValue?: any
  field?: string
  fieldName: string
  unique?:
    | string
    | true
    | {
        name: string
        msg: string
      }
}

export interface CompareFields {
  old: Field
  current: Field
}

export interface Fields {
  [key: string]: Field
}

export interface uniqueKey {
  fields: string[]
  name: string
  table: string
}
export interface UKeyConstraints {
  [key: string]: uniqueKey
}

export interface Model {
  fields: Fields
  modelName: string
  tableName: string
  pka?: string[]
}

export interface Reference {
  table: string
  field: string
}

export interface FKeyConstraint {
  fields: string[]
  type: string
  name: string
  references: Reference
  onDelete: string | undefined
  onUpdate: string | undefined
  tableName: string
}

export interface Models {
  [key: string]: Model
}
export interface CompareModels {
  old: Model
  current: Model
}

export interface FKeyConstraints {
  [key: string]: FKeyConstraint
}

export interface Schema {
  models: Models
  fKeyConstraints: FKeyConstraints
  uKeyConstraints: UKeyConstraints
  indexes: Indexes
}

export interface AddColumn {
  tableName: string
  fieldName: string
}

export interface Index {
  tableName: string
  name: string
  type: string | undefined
  using: string | undefined
  operator: string | undefined
  unique: boolean
  concurrently: boolean
  fields: string[]
}

export interface Indexes {
  [key: string]: Index
}
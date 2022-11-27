import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  CreationOptional,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize
} from 'sequelize'
import type { Post } from './Post'
import type { Tag } from './Tag'

type PostTagAssociations = 'post' | 'tag'

export class PostTag extends Model<
  InferAttributes<PostTag, {omit: PostTagAssociations}>,
  InferCreationAttributes<PostTag, {omit: PostTagAssociations}>
> {
  declare id: CreationOptional<number>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // PostTag belongsTo Post
  declare post?: NonAttribute<Post>
  declare getPost: BelongsToGetAssociationMixin<Post>
  declare setPost: BelongsToSetAssociationMixin<Post, number>
  declare createPost: BelongsToCreateAssociationMixin<Post>
  
  // PostTag belongsTo Tag
  declare tag?: NonAttribute<Tag>
  declare getTag: BelongsToGetAssociationMixin<Tag>
  declare setTag: BelongsToSetAssociationMixin<Tag, number>
  declare createTag: BelongsToCreateAssociationMixin<Tag>
  
  declare static associations: {
    post: Association<PostTag, Post>,
    tag: Association<PostTag, Tag>
  }

  static initModel(sequelize: Sequelize): typeof PostTag {
    PostTag.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    }, {
      sequelize
    })
    
    return PostTag
  }
}

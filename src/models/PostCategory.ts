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
import type { Category } from './Category'
import type { Post } from './Post'

type PostCategoryAssociations = 'post' | 'category'

export class PostCategory extends Model<
  InferAttributes<PostCategory, {omit: PostCategoryAssociations}>,
  InferCreationAttributes<PostCategory, {omit: PostCategoryAssociations}>
> {
  declare id: CreationOptional<number>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // PostCategory belongsTo Post
  declare post?: NonAttribute<Post>
  declare getPost: BelongsToGetAssociationMixin<Post>
  declare setPost: BelongsToSetAssociationMixin<Post, number>
  declare createPost: BelongsToCreateAssociationMixin<Post>
  
  // PostCategory belongsTo Category
  declare category?: NonAttribute<Category>
  declare getCategory: BelongsToGetAssociationMixin<Category>
  declare setCategory: BelongsToSetAssociationMixin<Category, number>
  declare createCategory: BelongsToCreateAssociationMixin<Category>
  
  declare static associations: {
    post: Association<PostCategory, Post>,
    category: Association<PostCategory, Category>
  }

  static initModel(sequelize: Sequelize): typeof PostCategory {
    PostCategory.init({
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
    
    return PostCategory
  }
}

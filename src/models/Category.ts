import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  CreationOptional,
  DataTypes,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from "sequelize"
import type { Post } from "./Post"
import type { PostCategory } from "./PostCategory"

type CategoryAssociations = "parent" | "children" | "postCategories" | "posts"

export class Category extends Model<
  InferAttributes<Category, { omit: CategoryAssociations }>,
  InferCreationAttributes<Category, { omit: CategoryAssociations }>
> {
  declare id: CreationOptional<number>
  declare title: string
  declare metaTitle: string | null
  declare slug: string
  declare content: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Category belongsTo Category (as Parent)
  declare parent?: NonAttribute<Category>
  declare getParent: BelongsToGetAssociationMixin<Category>
  declare setParent: BelongsToSetAssociationMixin<Category, number>
  declare createParent: BelongsToCreateAssociationMixin<Category>

  // Category hasMany Category (as Children)
  declare children?: NonAttribute<Category[]>
  declare getChildren: HasManyGetAssociationsMixin<Category>
  declare setChildren: HasManySetAssociationsMixin<Category, number>
  declare addChild: HasManyAddAssociationMixin<Category, number>
  declare addChildren: HasManyAddAssociationsMixin<Category, number>
  declare createChild: HasManyCreateAssociationMixin<Category>
  declare removeChild: HasManyRemoveAssociationMixin<Category, number>
  declare removeChildren: HasManyRemoveAssociationsMixin<Category, number>
  declare hasChild: HasManyHasAssociationMixin<Category, number>
  declare hasChildren: HasManyHasAssociationsMixin<Category, number>
  declare countChildren: HasManyCountAssociationsMixin

  // Category hasMany PostCategory
  declare postCategories?: NonAttribute<PostCategory[]>
  declare getPostCategories: HasManyGetAssociationsMixin<PostCategory>
  declare setPostCategories: HasManySetAssociationsMixin<PostCategory, number>
  declare addPostCategory: HasManyAddAssociationMixin<PostCategory, number>
  declare addPostCategories: HasManyAddAssociationsMixin<PostCategory, number>
  declare createPostCategory: HasManyCreateAssociationMixin<PostCategory>
  declare removePostCategory: HasManyRemoveAssociationMixin<PostCategory, number>
  declare removePostCategories: HasManyRemoveAssociationsMixin<PostCategory, number>
  declare hasPostCategory: HasManyHasAssociationMixin<PostCategory, number>
  declare hasPostCategories: HasManyHasAssociationsMixin<PostCategory, number>
  declare countPostCategories: HasManyCountAssociationsMixin

  // Category belongsToMany Post
  declare posts?: NonAttribute<Post[]>
  declare getPosts: BelongsToManyGetAssociationsMixin<Post>
  declare setPosts: BelongsToManySetAssociationsMixin<Post, number>
  declare addPost: BelongsToManyAddAssociationMixin<Post, number>
  declare addPosts: BelongsToManyAddAssociationsMixin<Post, number>
  declare createPost: BelongsToManyCreateAssociationMixin<Post>
  declare removePost: BelongsToManyRemoveAssociationMixin<Post, number>
  declare removePosts: BelongsToManyRemoveAssociationsMixin<Post, number>
  declare hasPost: BelongsToManyHasAssociationMixin<Post, number>
  declare hasPosts: BelongsToManyHasAssociationsMixin<Post, number>
  declare countPosts: BelongsToManyCountAssociationsMixin

  declare static associations: {
    parent: Association<Category, Category>
    children: Association<Category, Category>
    postCategories: Association<Category, PostCategory>
    posts: Association<Category, Post>
  }

  static initModel(sequelize: Sequelize): typeof Category {
    Category.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(75),
          allowNull: false,
        },
        metaTitle: {
          type: DataTypes.STRING(100),
        },
        slug: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        content: {
          type: DataTypes.TEXT,
        },
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        underscored: true,
      }
    )

    return Category
  }
}

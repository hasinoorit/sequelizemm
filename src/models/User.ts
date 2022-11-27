import {
  Association,
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

type UserAssociations = "posts"

export class User extends Model<
  InferAttributes<User, { omit: UserAssociations }>,
  InferCreationAttributes<User, { omit: UserAssociations }>
> {
  declare id: CreationOptional<number>
  declare firstName: string | null
  declare middleName: string | null
  declare lastName: string | null
  declare mobile: string | null
  declare email: string | null
  declare passwordHash: string | null
  declare registeredAt: Date
  declare lastLogin: Date | null
  declare intro: string | null
  declare profile: string | null
  declare skills: string[] | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // User hasMany Post
  declare posts?: NonAttribute<Post[]>
  declare getPosts: HasManyGetAssociationsMixin<Post>
  declare setPosts: HasManySetAssociationsMixin<Post, number>
  declare addPost: HasManyAddAssociationMixin<Post, number>
  declare addPosts: HasManyAddAssociationsMixin<Post, number>
  declare createPost: HasManyCreateAssociationMixin<Post>
  declare removePost: HasManyRemoveAssociationMixin<Post, number>
  declare removePosts: HasManyRemoveAssociationsMixin<Post, number>
  declare hasPost: HasManyHasAssociationMixin<Post, number>
  declare hasPosts: HasManyHasAssociationsMixin<Post, number>
  declare countPosts: HasManyCountAssociationsMixin

  declare static associations: {
    posts: Association<User, Post>
  }

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        firstName: {
          type: DataTypes.STRING(50),
        },
        middleName: {
          type: DataTypes.STRING(50),
        },
        lastName: {
          type: DataTypes.STRING(50),
        },
        mobile: {
          type: DataTypes.STRING(15),
        },
        email: {
          type: DataTypes.STRING(50),
        },
        passwordHash: {
          type: DataTypes.STRING(32),
        },
        registeredAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        lastLogin: {
          type: DataTypes.DATE,
        },
        intro: {
          type: DataTypes.TEXT,
        },
        profile: {
          type: DataTypes.TEXT,
        },
        skills: {
          type: DataTypes.ARRAY(DataTypes.STRING),
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
      }
    )

    return User
  }
}

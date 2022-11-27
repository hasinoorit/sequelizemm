import {
  Association,
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
  Sequelize
} from 'sequelize'
import type { Post } from './Post'
import type { PostTag } from './PostTag'

type TagAssociations = 'postTags' | 'posts'

export class Tag extends Model<
  InferAttributes<Tag, {omit: TagAssociations}>,
  InferCreationAttributes<Tag, {omit: TagAssociations}>
> {
  declare id: CreationOptional<number>
  declare title: string
  declare metaTitle: string | null
  declare slug: string
  declare content: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Tag hasMany PostTag
  declare postTags?: NonAttribute<PostTag[]>
  declare getPostTags: HasManyGetAssociationsMixin<PostTag>
  declare setPostTags: HasManySetAssociationsMixin<PostTag, number>
  declare addPostTag: HasManyAddAssociationMixin<PostTag, number>
  declare addPostTags: HasManyAddAssociationsMixin<PostTag, number>
  declare createPostTag: HasManyCreateAssociationMixin<PostTag>
  declare removePostTag: HasManyRemoveAssociationMixin<PostTag, number>
  declare removePostTags: HasManyRemoveAssociationsMixin<PostTag, number>
  declare hasPostTag: HasManyHasAssociationMixin<PostTag, number>
  declare hasPostTags: HasManyHasAssociationsMixin<PostTag, number>
  declare countPostTags: HasManyCountAssociationsMixin
  
  // Tag belongsToMany Post
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
    postTags: Association<Tag, PostTag>,
    posts: Association<Tag, Post>
  }

  static initModel(sequelize: Sequelize): typeof Tag {
    Tag.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(75),
        allowNull: false
      },
      metaTitle: {
        type: DataTypes.STRING(100)
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      content: {
        type: DataTypes.TEXT
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
    
    return Tag
  }
}

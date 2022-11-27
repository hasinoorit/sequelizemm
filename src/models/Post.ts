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
import type { Category } from "./Category"
import type { PostCategory } from "./PostCategory"
import type { PostComment } from "./PostComment"
import type { PostNeta } from "./PostNeta"
import type { PostTag } from "./PostTag"
import type { Tag } from "./Tag"
import type { User } from "./User"

type PostAssociations =
  | "author"
  | "parent"
  | "children"
  | "postCategories"
  | "categories"
  | "comments"
  | "metas"
  | "postTags"
  | "tags"

export class Post extends Model<
  InferAttributes<Post, { omit: PostAssociations }>,
  InferCreationAttributes<Post, { omit: PostAssociations }>
> {
  declare id: CreationOptional<number>
  declare title: string
  declare metaTitle: string | null
  declare slug: string
  declare summary: string | null
  declare published: boolean
  declare publishedAt: Date | null
  declare content: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Post belongsTo User (as Author)
  declare author?: NonAttribute<User>
  declare getAuthor: BelongsToGetAssociationMixin<User>
  declare setAuthor: BelongsToSetAssociationMixin<User, number>
  declare createAuthor: BelongsToCreateAssociationMixin<User>

  // Post belongsTo Post (as Parent)
  declare parent?: NonAttribute<Post>
  declare getParent: BelongsToGetAssociationMixin<Post>
  declare setParent: BelongsToSetAssociationMixin<Post, number>
  declare createParent: BelongsToCreateAssociationMixin<Post>

  // Post hasMany Post (as Children)
  declare children?: NonAttribute<Post[]>
  declare getChildren: HasManyGetAssociationsMixin<Post>
  declare setChildren: HasManySetAssociationsMixin<Post, number>
  declare addChild: HasManyAddAssociationMixin<Post, number>
  declare addChildren: HasManyAddAssociationsMixin<Post, number>
  declare createChild: HasManyCreateAssociationMixin<Post>
  declare removeChild: HasManyRemoveAssociationMixin<Post, number>
  declare removeChildren: HasManyRemoveAssociationsMixin<Post, number>
  declare hasChild: HasManyHasAssociationMixin<Post, number>
  declare hasChildren: HasManyHasAssociationsMixin<Post, number>
  declare countChildren: HasManyCountAssociationsMixin

  // Post hasMany PostCategory
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

  // Post belongsToMany Category
  declare categories?: NonAttribute<Category[]>
  declare getCategories: BelongsToManyGetAssociationsMixin<Category>
  declare setCategories: BelongsToManySetAssociationsMixin<Category, number>
  declare addCategory: BelongsToManyAddAssociationMixin<Category, number>
  declare addCategories: BelongsToManyAddAssociationsMixin<Category, number>
  declare createCategory: BelongsToManyCreateAssociationMixin<Category>
  declare removeCategory: BelongsToManyRemoveAssociationMixin<Category, number>
  declare removeCategories: BelongsToManyRemoveAssociationsMixin<Category, number>
  declare hasCategory: BelongsToManyHasAssociationMixin<Category, number>
  declare hasCategories: BelongsToManyHasAssociationsMixin<Category, number>
  declare countCategories: BelongsToManyCountAssociationsMixin

  // Post hasMany PostComment (as Comments)
  declare comments?: NonAttribute<PostComment[]>
  declare getComments: HasManyGetAssociationsMixin<PostComment>
  declare setComments: HasManySetAssociationsMixin<PostComment, number>
  declare addComment: HasManyAddAssociationMixin<PostComment, number>
  declare addComments: HasManyAddAssociationsMixin<PostComment, number>
  declare createComment: HasManyCreateAssociationMixin<PostComment>
  declare removeComment: HasManyRemoveAssociationMixin<PostComment, number>
  declare removeComments: HasManyRemoveAssociationsMixin<PostComment, number>
  declare hasComment: HasManyHasAssociationMixin<PostComment, number>
  declare hasComments: HasManyHasAssociationsMixin<PostComment, number>
  declare countComments: HasManyCountAssociationsMixin

  // Post hasMany PostNeta (as Meta)
  declare metas?: NonAttribute<PostNeta[]>
  declare getMetas: HasManyGetAssociationsMixin<PostNeta>
  declare setMetas: HasManySetAssociationsMixin<PostNeta, number>
  declare addMeta: HasManyAddAssociationMixin<PostNeta, number>
  declare addMetas: HasManyAddAssociationsMixin<PostNeta, number>
  declare createMeta: HasManyCreateAssociationMixin<PostNeta>
  declare removeMeta: HasManyRemoveAssociationMixin<PostNeta, number>
  declare removeMetas: HasManyRemoveAssociationsMixin<PostNeta, number>
  declare hasMeta: HasManyHasAssociationMixin<PostNeta, number>
  declare hasMetas: HasManyHasAssociationsMixin<PostNeta, number>
  declare countMetas: HasManyCountAssociationsMixin

  // Post hasMany PostTag
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

  // Post belongsToMany Tag
  declare tags?: NonAttribute<Tag[]>
  declare getTags: BelongsToManyGetAssociationsMixin<Tag>
  declare setTags: BelongsToManySetAssociationsMixin<Tag, number>
  declare addTag: BelongsToManyAddAssociationMixin<Tag, number>
  declare addTags: BelongsToManyAddAssociationsMixin<Tag, number>
  declare createTag: BelongsToManyCreateAssociationMixin<Tag>
  declare removeTag: BelongsToManyRemoveAssociationMixin<Tag, number>
  declare removeTags: BelongsToManyRemoveAssociationsMixin<Tag, number>
  declare hasTag: BelongsToManyHasAssociationMixin<Tag, number>
  declare hasTags: BelongsToManyHasAssociationsMixin<Tag, number>
  declare countTags: BelongsToManyCountAssociationsMixin

  declare static associations: {
    author: Association<Post, User>
    parent: Association<Post, Post>
    children: Association<Post, Post>
    postCategories: Association<Post, PostCategory>
    categories: Association<Post, Category>
    comments: Association<Post, PostComment>
    metas: Association<Post, PostNeta>
    postTags: Association<Post, PostTag>
    tags: Association<Post, Tag>
  }

  static initModel(sequelize: Sequelize): typeof Post {
    Post.init(
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
        summary: {
          type: DataTypes.TEXT,
        },
        published: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        publishedAt: {
          type: DataTypes.DATE,
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
      }
    )

    return Post
  }
}

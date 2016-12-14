const path 		= require('path');
const objection = require('objection');
const db 		= require(path.join(__dirname, '../../scripts/db'));
const config 	= require(path.join(__dirname, '../../scripts/config'));
const knex 		= db.knex;
const Model 	= objection.Model;

Model.knex(knex);

class User extends Model {
	static get tableName() {
		return 'users';
	}

	static get relationMappings() {
		return {
			profile: {
				relation: Model.HasOneRelation,
				modelClass: Profile,
				join: {
					from: 'users.id',
					to: 'profiles.user_id'
				}
			}
		};
	}
}

class Profile extends Model {
	static get tableName() {
		return 'profiles';
	}

	static get relationMappings() {
		return {
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'users.id',
					to: 'profiles.user_id'
				}
			}
		};
	}
}

class ActivationToken extends Model {
	static get tableName() {
		return 'activation_tokens';
	}
}

class Blog extends Model {
	static get tableName() {
		return 'blogs';
	}

	static get relationMappings() {
		return {
			posts: {
				relation: Model.HasManyRelation,
				modelClass: Post,
				join: {
					from: 'blogs.id',
					to: 'posts.blog_id'
				}
			},
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'users.id',
					to: 'blogs.user_id'
				}
			}
		};
	}
}

class Post extends Model {
	static get tableName() {
		return 'posts';
	}

	static get relationMappings() {
		return {
			blog: {
				relation: Model.BelongsToOneRelation,
				modelClass: Blog,
				join: {
					from: 'blogs.id',
					to: 'posts.blog_id'
				}
			},
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'users.id',
					to: 'posts.user_id'
				}
			}
		};
	}
}

class Comment extends Model {
	static get tableName() {
		return 'comments';
	}

	static get relationMappings() {
		return {
			post: {
				relation: Model.BelongsToOneRelation,
				modelClass: Post,
				join: {
					from: 'posts.id',
					to: 'comments.post_id'
				}
			},
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'users.id',
					to: 'comments.user_id'
				}
			}
		};
	}
}

module.exports = {
	User: User,
	ActivationToken: ActivationToken,
	Profile: Profile,
	Blog: Blog,
	Post: Post,
	Comment: Comment
};

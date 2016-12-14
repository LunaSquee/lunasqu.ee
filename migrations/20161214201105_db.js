
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('users', (table) => {
			table.increments('id').primary();
			table.string('username', 26).unique().notNullable();
			table.string('display_name', 32).notNullable();
			table.string('email').unique().notNullable();
			table.string('avatar_file').defaultTo('');
			table.text('password').notNullable();

			table.boolean('activated').defaultTo(false);
			
			table.timestamps();
		}),
		knex.schema.createTable('profiles', (table) => {
			table.increments('id').primary();
			table.integer('user_id').unsigned().notNullable();
			table.dateTime('birthday');
			table.text('bio');
			table.text('website');
			table.string('country');

			table.foreign('user_id').references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
		}),
		knex.schema.createTable('blogs', (table) => {
			table.increments('id').primary();
			table.text('title').notNullable();
			table.text('description').notNullable();
			table.text('tags').defaultTo(null);

			table.integer('user_id').unsigned().notNullable();
			
			table.timestamps();

			table.foreign('user_id').references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
		}),
		knex.schema.createTable('posts', (table) => {
			table.increments('id').primary();
			table.text('title').notNullable();
			table.text('text').notNullable();
			table.text('tags').defaultTo(null);

			table.integer('user_id').unsigned().notNullable();
			table.integer('blog_id').unsigned().notNullable();
			
			table.timestamps();

			table.foreign('user_id').references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
			table.foreign('blog_id').references('blogs.id').onDelete('CASCADE').onUpdate('CASCADE');
		}),
		knex.schema.createTable('comments', (table) => {
			table.increments('id').primary();
			table.text('text').notNullable();

			table.integer('user_id').unsigned().notNullable();
			table.integer('post_id').unsigned().notNullable();
			table.integer('reply_to').unsigned().defaultTo(null);

			table.timestamps();

			table.foreign('user_id').references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
			table.foreign('post_id').references('posts.id').onDelete('CASCADE').onUpdate('CASCADE');
			table.foreign('reply_to').references('comments.id').onDelete('CASCADE').onUpdate('CASCADE');
		}),
		knex.schema.createTable('activation_tokens', (table) => {
			table.increments('id').primary();
			table.integer('user_id').unsigned().notNullable();
			table.text('token').notNullable();
			table.dateTime('expiry');

			table.foreign('user_id').references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('users'),
		knex.schema.dropTable('profiles'),
		knex.schema.dropTable('blogs'),
		knex.schema.dropTable('comments'),
		knex.schema.dropTable('activation_tokens')
	]);
};

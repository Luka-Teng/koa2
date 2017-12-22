const db = require('../db')

module.exports = db.defineModel('users', {
	email: {
		type: db.STRING(100),
		unique: true,
		validate: {
			isEmail: true
		}
	},
	passwd: db.STRING(100),
	name: db.STRING(100),
	gender: {
		type: db.STRING,
		validate: {
			isIn: {
				args: ['male', 'female'],
				msg: 'Must male or female'
			}
		}
	}
})
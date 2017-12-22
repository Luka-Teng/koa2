const User = require('./model').User
const passport = require('koa-passport')
const localStrategy = require('passport-local')

//local Strategy
passport.use(new localStrategy(async (username, password, done) => {
	let where = {where: {email: username}}
	try {
		let result = (await User.findOne(where)).dataValues		
		if (result) {
            if (result.passwd == password) {
                return done(null, result)
            } else {
                return done(null, false, '密码错误')
            }
        } else {
            return done(null, false, '未知用户')
        }
	} catch (e) {
		console.log(e)
		return done(null, false, { message: e })
	}	
}))
// serializeUser 在用户登录验证成功以后将会把用户的数据存储到 session 中
passport.serializeUser(function (user, done) {
    done(null, user)
})
// deserializeUser 在每次请求的时候将从 session 中读取用户对象
passport.deserializeUser(function (user, done) {
    return done(null, user)
})

//auth router
var fn_login = async (ctx, next) => {
	return passport.authenticate('local', function (err, user, info, status) {
        if (user) {
            ctx.login(user)
            ctx.body = {
            	status: 'success' 
            }
        } else {
            ctx.throw(500, info)
        }
    })(ctx, next)
}

var fn_logout = async (ctx) => {
	ctx.logout()
    ctx.body = {
    	status: 'success'
    }
}

var fn_signup = async (ctx) => {
	let name = ctx.request.name
	let email = ctx.request.email
	let password = ctx.request.password
	let gender = ctx.request.gender
	try {
		let user  = await User.create({
			name,
			email,
			password,
			gender
		})
		ctx.login(user)
		ctx.body = {
			status: 'success'
		}		
	} catch (e) {
		ctx.throw(500, e)
	}
}

module.exports = {
    'POST /login': fn_login,
    'GET /logout': fn_logout,
    'POST /singup': fn_signup
}
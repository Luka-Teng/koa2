const User = require('./../model').User
const passport = require('koa-passport')
const localStrategy = require('passport-local')

//local Strategy
passport.use(new localStrategy(async (username, password, done) => {
	let where = {where: {email: username}}
	try {
		let result = await User.findOne(where)		
		if (result) {
            if (result.dataValues.passwd == password) {
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
let fn_login = async (ctx, next) => {
	return passport.authenticate('local', async (err, user, info, status) => {
        if (user) {
            await ctx.login(user)
            ctx.body = {
            	status: 'success' 
            }
        } else {
            ctx.throw(500, info)
        }
    })(ctx, next)
}

let fn_logout = async (ctx) => {
	ctx.logout()
    ctx.body = {
    	status: 'success'
    }
}

let fn_signup = async (ctx) => {
	let name = ctx.request.body.name
	let email = ctx.request.body.email
	let password = ctx.request.body.password
	let gender = ctx.request.body.gender
	try {
		let user  = await User.create({
			name,
			email,
			passwd: password,
			gender
		})
		await ctx.login(user)
		ctx.body = {
			status: 'success'
		}		
	} catch (e) {
		ctx.throw(500, e)
	}
}

let fn_status = async (ctx, next) => {
    ctx.body = {
    	isLogged: ctx.isAuthenticated(),
    	user: ctx.state.user
    }
}

let fn_signup_form = async (ctx, next) => {
	ctx.body = `
		<form action='/signup' method='POST'>
			<div>username <input name='name'></div>
			<div>email <input name='email'></div>
			<div>password <input name='password'></div>
			<div>gender <input name='gender'></div>
			<button>submit</button>
		</form>
	`
}

let fn_login_form = async (ctx, next) => {
	ctx.body = `
		<form action='/login' method='POST'>
			<div>username <input name='username'></div>
			<div>password <input name='password'></div>
			<button>submit</button>
		</form>
	`
}

module.exports = {
    'POST /login': fn_login,
    'GET /logout': fn_logout,
    'POST /signup': fn_signup,
    'GET /status': fn_status,
    'GET /signup': fn_signup_form,
    'GET /login': fn_login_form
}
const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')

//verify strategy
const User = require('./model').User
const passport = require('koa-passport')
const localStrategy = require('passport-local')
passport.use(new localStrategy(async (username, password, done) => {
	let where = {where: {email: username}}
	try {
		let result = (await User.findOne(where)).dataValues		
		console.log(result)
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

//定义路由
const Router = require('koa-router')
const router = new Router()
router.post('/login', async (ctx, next) => {
	return passport.authenticate('local', async (err, user, info, status) => {
        if (user) {
            await ctx.login(user)
            ctx.redirect('/')
        } else {
            ctx.body = info
        }
    })(ctx, next)
})
router.get('/logout', async (ctx, next) => {
    ctx.logout()
    ctx.body = 'Y'
})
router.get('/form', async (ctx, next) => {
	ctx.body = `
		<form action='/login' method='POST'>
			<div>username <input name='username'></div>
			<div>password <input name='password'></div>
			<button>submit</button>
		</form>
	`
})
router.get('/signup_form', async (ctx, next) => {
	ctx.body = `
		<form action='/signup' method='POST'>
			<div>username <input name='name'></div>
			<div>email <input name='email'></div>
			<div>password <input name='password'></div>
			<div>password <input name='gender'></div>
			<button>submit</button>
		</form>
	`
})
router.post('/signup', async (ctx) => {
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
})
router.get('/status', async (ctx, next) => {
    ctx.body = {
    	isLogged: ctx.isAuthenticated(),
    	user: ctx.state.user
    }
})
router.get('/test', async (ctx, next) => {
    ctx.throw(500, 'error occur')
})
//start app
app.proxy = true
const session = require('koa-session2')
app.use(session({key: "SESSIONID"}))
app.use(bodyParser())  
//error handling  ctx.throw(500, msg, vars)
const handler = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500;
    ctx.response.body = {
      message: err.message
    }
    ctx.app.emit('error', err, ctx)
  }
}
app.on('error', function(err) {
  console.log('logging error ', err.message)
  console.log(err)
})
app.use(handler)
app.use(passport.initialize())
app.use(passport.session())
app.use(router.routes())

app.listen(3000)
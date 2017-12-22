const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const controller = require('./controller')
const staticFiles = require('./staticFiles')
const model = require('./model')

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

app.use(bodyParser())
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`)
    await next()
})
app.use(staticFiles('/static/', __dirname + '/static'))
app.use(controller())
app.listen(3000)
console.log("app started at port 3000...")
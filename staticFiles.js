const path = require('path')
const mime = require('mime')
const fs = require('mz/fs')

function staticFiles (url, dir) {
	return async function (ctx, next) {
		let rpath = ctx.request.path
		if (rpath.startsWith(url)) {
			let fp = path.join(dir, rpath.substring(url.length))
			if (await fs.exists(fp)) {
				ctx.response.type = mime.getType(rpath)
				ctx.response.body = await fs.readFile(fp)
			} else {
				ctx.throw(404, 'Not found')
			}
		} else {
			await next()
		}
	}
}

module.exports = staticFiles
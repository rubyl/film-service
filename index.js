const Koa = require("koa");
const cors = require('@koa/cors');
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require("koa-logger");
const ObjectID = require("mongodb").ObjectID;
const jwt = require("./middleware/jwt");
const requestBody = require('./middleware/requestBody');

const app = new Koa();
const router = new Router();
const securedRouter = new Router();
require("./mongo")(app)

app.use(BodyParser())
app.use(logger());
app.use(cors());
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err)
    err.status = err.statusCode || err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});
// app.use(requestBody());
app.use(router.routes()).use(router.allowedMethods());
app.use(securedRouter.routes()).use(securedRouter.allowedMethods());
securedRouter.use(jwt.errorHandler()).use(jwt.jwt());


router.get("/", async (ctx, next) => {
  ctx.body = await ctx.app.film.find().toArray();
});

// router.use("/film/:id", requestBody())
router.get("/film/:id", async (ctx) => {
  ctx.body = await ctx.app.film.findOne({
    "_id": ObjectID(ctx.params.id)
  });
});

router.post("/film", async function(ctx) {
  ctx.body = await ctx.app.film.insert(ctx.request.body);
});

router.put("/film/:id", async function(ctx) {
  let documentQuery = {
    "_id": ObjectID(ctx.params.id)
  };
  let valuesToUpdate = ctx.request.body;
  ctx.body = await ctx.app.film.updateOne(documentQuery, {
    $set: valuesToUpdate
  });
})

router.delete("/film/:id", async function(ctx) {
  let documentQuery = {
    "_id": ObjectID(ctx.params.id)
  };
  ctx.body = await ctx.app.film.deleteOne(documentQuery)
})

router.post("/auth", async (ctx) => {
  let username = ctx.request.body.username;
  let password = ctx.request.body.password;

  if (username === "user" && password === "pwd") {
    ctx.body = {
      token: jwt.issue({
        user: "user",
        role: "admin"
      })
    }
  } else {
    ctx.status = 401;
    ctx.body = {
      error: "Invalid login"
    }
  }
});

app.listen(3000);
const Koa = require("koa");
const Router = require("@koa/router");
const _ = new Router();
const app = new Koa();
const views = require("koa-views");
const path = require("path");
const serve = require("koa-static");
const port = 3002;

app.use(
  views(path.join(__dirname, "views/layout"), {
    extension: "pug",
    options: {
      cache: false,
    },
  })
);
app.use(serve(path.join(__dirname, "public")));

//Error Handler that is upstreamed when error occurs
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message || "Internal Server Error";
    ctx.app.emit("error", err, ctx);
  }
});

_.get("/test-check", async (ctx, next) => {
  ctx.body = "Test";
});
_.get(/^(\/(?:recipe|home|about)?)$/, async (ctx) => {
  const contentArgs = {
    recipe: {
      title: "Spaghetti Bolognese",
      ingredients: [
        "200g Spaghetti",
        "100g Hackfleisch",
        "1 Zwiebel",
        "2 Knoblauchzehen",
        "400g Tomaten",
        "Salz und Pfeffer",
      ],
      instructions:
        "Kochen Sie die Spaghetti gemäß den Anweisungen auf der Packung. Braten Sie das Hackfleisch in einer Pfanne an, fügen Sie die gehackte Zwiebel und Knoblauch hinzu und kochen Sie weiter, bis sie weich sind. Geben Sie die Tomaten hinzu und lassen Sie die Sauce köcheln. Würzen Sie die Sauce nach Geschmack und servieren Sie sie mit den Spaghetti.",
    },
    urlPath: ctx.path,
  };
  await ctx.render("main", contentArgs);
});

_.get(/^(?!\/(recipe|home|about|test-check)$).*/, async (ctx) => {
  ctx.throw(404, "Seite nicht gefunden");
});

app.use(_.routes()).use(_.allowedMethods());

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

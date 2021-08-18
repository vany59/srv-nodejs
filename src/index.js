require("./common/lib/mongo");

const express = require("express");

const app = express();

//middlewrare
app.use(require("cors")());
app.use(require("compression")());
app.use(require("helmet")({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: false }));

app.listen(process.env.PORT || 3000, () => {
  console.log("server listenning");
});

app.use("/api", require("./app/route"));

app.use(require("./common/utils/interceptor"));

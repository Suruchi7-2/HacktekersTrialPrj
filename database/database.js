const mongoose = require("mongoose");

const dbUrl = "mongodb://127.0.0.1:27017/hacktechers";

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => {
    console.log(err);
  });

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected");
});

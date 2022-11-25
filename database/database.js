const mongoose = require("mongoose");

const dbUrl = "mongodb://localhost:27017/hecktecherst";

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

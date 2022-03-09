const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const userRouter = require("./routes/user.route");
const walletRouter = require("./routes/wallet.route");
const transactionRouter = require("./routes/transaction.route");
const fileRouter = require("./routes/file.route");

const app = express();
app.use(
  fileUpload({
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  })
);
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/user", userRouter);
app.use("/wallet", walletRouter);
app.use("/transaction", transactionRouter);
app.use("/file", fileRouter);
app.get("/", (req, res) => {
  res.send("Hikers API");
});

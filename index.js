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

// Allowed Origins. Update to match BE and FE domains
// const allowed_origins = ["http://localhost:3000", "http://localhost:3001"];
// const allowed_origins = [
//   "http://localhost",
//   "https://api.tradehikers.xyz",
//   "https://tradehikers.xyz",
//   "https://www.tradehikers.xyz",
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowed_origins.includes(origin))
//         return callback(null, true);

//       callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   })
// );

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("./public"));
app.use("/user", userRouter);
app.use("/wallet", walletRouter);
app.use("/transaction", transactionRouter);
app.use("/file", fileRouter);
app.get("/", (req, res) => {
  res.send("Hikers API");
});

const port = process.env.PORT || 3001;
const ip = process.env.ip;
app.listen(port, () => {
  console.log(`
  ✨✨-----------------------------------✨✨
  ✨                                       ✨
  | Server started at http://${ip}:${port} |
  ✨                                       ✨
  ✨✨------------------------------ ----✨✨
  `);
});

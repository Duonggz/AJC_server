import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

import connections from "./config/Database";
import routes from "./routes";
import initSocket from "./events";

// Cấu hình dotenv
dotenv.config();

// kết nối tới DB của mongo
connections.MongoDB();

// tạo app là đường dẫn gốc trong thư mục
const app = express();

// Cấu hình thư mục public cho static
app.use(express.static(path.join(__dirname, "public")));

// sử dụng cors để kiểm tra origin
app.use(
  cors({
    credentials: true,
    origin: (req, next) => {
      console.log(req);
      next(null, true);
    },
  }),
);

// sử dụng body-parser để parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình sử dụng routes để định tuyến các tuyến đường cho app
app.use(routes);

// middleware bắt lỗi
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.log(err);

  return res.status(status).json({
    message: err.message,
  });
});

// gắn nghe cho app và gán vào server
const server = app.listen(process.env.PORT || 80, () => {
  console.log(`Server đang chạy ở cổng ${process.env.PORT}`);
});

// khởi tạo socket
initSocket(server);

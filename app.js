import express from "express";
import morgan from "morgan";  // 로그를 남겨줌
import helmet from "helmet";  // 기초 보안 담당
import cookieParser from "cookie-parser";  // 쿠키를 다룰 수 있음
import bodyParser from "body-parser";      // form데이터를 서버로 받아와서 활용가능
import { localsMiddleware } from "./middlewares";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import globalRouter from "./routers/globalRouter";
import routes from "./routes";

const app = express();

// middleware로 로그인 여부 캐치, 접속에 대한 로그를 작성 등 
// middleware들이 끝난 뒤 아래 route들이 실행된다
// middleware과 route의 코드 순서에 따라 실행이 달라짐
// app.use 방식은 전역적임
app.set("view engine", "pug");
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());
app.use(morgan("dev"));

app.use(localsMiddleware);

app.use(routes.home, globalRouter);
app.use(routes.users, userRouter);
app.use(routes.videos, videoRouter);

export default app;
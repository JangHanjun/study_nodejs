import routes from "./routes";
// routes에 있는 것들을 전역적으로 사용할 수 있게 해줌
export const localsMiddleware = (req, res, next) => {
     res.locals.siteName = 'Wetube';
     res.locals.routes = routes;
     next();
};
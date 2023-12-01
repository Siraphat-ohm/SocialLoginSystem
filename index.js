const createServer = require("./server")
const PORT = process.env.PORT || 30788;
const app = createServer();

app.listen( PORT, () => {
    console.log(`server start on port : ${PORT}`);
});
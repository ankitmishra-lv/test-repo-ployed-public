const http = require("http");

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Hello World\n");
});

server.listen(port, host, () => {
  console.log(`Hello World server running at http://${host}:${port}/`);
});

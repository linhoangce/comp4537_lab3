const http = require("http");
const fs = require("fs");
const path = require("path");

const ServerTime = require("./myModules/utils");
const userMessage = require("./lang/en/en");

// 1. Define the handler function
const serverHandler = (req, res) => {
	const baseUrl = `https://${req.headers.host}`;
	const myUrl = new URL(req.url, baseUrl);
	const pathname = myUrl.pathname;

	// Normalize path to handle leading/trailing slashes
	const cleanPath = pathname.replace(/\/$/, "");

	// GET DATE
	if (cleanPath.endsWith("/getDate")) {
		const name = myUrl.searchParams.get("name") || "Guest";
		const datetime = new ServerTime();
		let template = userMessage.template;
		const finalMessage = template.replace("%1", name).replace("%2", datetime.getCurrentTime());

		res.writeHead(200, { "Content-Type": "text/html" });
		res.write(`<div style='color:blue'>${finalMessage}</div>`);
		return res.end();
	}

	// WRITE FILE
	else if (cleanPath.endsWith("/writeFile")) {
		const text = myUrl.searchParams.get("text") + "\n";
		// Using /tmp/ is the ONLY way to (temporarily) write files on Vercel
		const filePath = path.join("/tmp", "file.txt");

		fs.appendFile(filePath, text, (error) => {
			if (error) {
				res.writeHead(500, { "Content-Type": "text/html" });
				return res.end("Error writing to file");
			}
			res.writeHead(200, { "Content-Type": "text/html" });
			return res.end(`Successfully appended: ${text}`);
		});
	}

	// READ FILE
	else if (cleanPath.includes("/readFile/")) {
		const filename = pathname.split("/").pop();
		// Remember to read from the same place you wrote to!
		const filePath = path.join("/tmp", filename);

		fs.readFile(filePath, "utf8", (err, data) => {
			if (err) {
				res.writeHead(404, { "Content-Type": "text/html" });
				return res.end(filename + " 404 Not Found!");
			}
			res.writeHead(200, { "Content-Type": "text/html" });
			res.write(`<pre>${data}</pre>`);
			return res.end();
		});
	} else {
		res.writeHead(404);
		res.end("Page not found!");
	}
};

// 2. Export for Vercel
module.exports = serverHandler;

// 3. Local testing logic (Fixes the 'app' error)
if (process.env.NODE_ENV !== "production") {
	const server = http.createServer(serverHandler);
	server.listen(8888, () => console.log("Running locally on 8888"));
}

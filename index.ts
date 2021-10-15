import fastify from "fastify";
import fastifyFormbody from "fastify-formbody";

const server = fastify();

server.register(fastifyFormbody);

const items: string[] = ["foo"];

const getHtml = () => `
<!DOCTYPE html>	
<html>
		<head>
			<meta charset="utf-8">

			<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

		</head>
		<body>
			<h1>
				CSP demo
			</h1>

			<form action="/submit" method="post">
				<label for="thing">Thing:</label>
				<br />
				<input type="text" id="thing" name="thing" value="qux" />
				<br />
				<input type="submit" value="Submit" />
			</form> 

			<form action="/reset" method="post">
				<input type="submit" value="reset" />
			</form> 
			
			<h2>
			List of items:
			</h2>
						
			<ul>			
${items.map((i) => `<li>${i}</li>`).join("\n")}
			<ul>
			
				<br/>
				<br/>
				<hr/>
				<br/>
				<br/>

				<img id="toast" src="https://assets.bonappetit.com/photos/5c62e4a3e81bbf522a9579ce/1:1/w_1920,c_limit/milk-bread.jpg" width="100px" height="100px" />

        <script>
          document.body.bgColor = 'lightblue'
        </script>
		</body>
	</html>
`;

interface FormBodySchema {
  thing: string;
}

server.post("/reset", async (request, reply): Promise<void> => {
  items.length = 0;

  reply.redirect(302, "/");
});

server.post<{ Body: FormBodySchema }>(
  "/submit",
  async (request, reply): Promise<void> => {
    const thing = request.body.thing;

    items.push(thing);

    reply.redirect(302, "/");
  }
);

const generateCSPHeaderContent = () => {
  return [].join(" ");
};

/* 

// Naive mitigation for all. Breaks images, breaks jQuery etc
"default-src 'none';",

// Mitigation for XSS attack 1.
"connect-src 'none';",

// Mitigation 1 for XSS attack 2
"img-src 'none';",

// Mitigation 2 for XSS attack 2
"img-src 'none' https://assets.bonappetit.com;",

// Mitigation 1 for XSS attack 3
"script-src 'self';",

// Mitigation 2 for XSS attack 3
"script-src https://code.jquery.com;",


// Mitigate all and allow our jQuery script and image file
"default-src 'none';",
"img-src 'none' https://assets.bonappetit.com;",
"script-src https://code.jquery.com;",

*/

server.get("/", async (request, reply) => {
  reply
    .code(200)
    .header("Content-Type", "text/html; charset=utf-8")
    .header("Content-Security-Policy", generateCSPHeaderContent())
    .send(getHtml());
});

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const { JWT_SECRET } = process.env;

function template(user) {
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });
  const url = `${process.env.BACKEND_URL}/activate/${token}`;

  const html = `
     <!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Email Confirmation</title>
		<style>
			.btn {
				background-color: aqua;
				color: brown;
				padding: 1em 1.5em;
        text-decoration: none;
        font-weight:bold;
				text-transform: capitalize;
			}
			.btn:hover {
				background-color: rgb(40, 167, 167);
			}
			.btn:active {
				background-color: rgb(40, 167, 167);
			}

			.btn:visited {
				background-color: rgb(40, 167, 167);
      }
      p{
        font-size: 15px;
        
        font-weight:bold;
      }
      h2{
        font-size:25px;
        font-weight:800;
        
      }
		</style>
	</head>
	<body>
    <h3>Hi ${user.firstName} ${user.lastName} </h3>
    <p>Thank you for registering on this platform</p>
    <hr/>
    <b><h2>Please Verify your email to complete the registration process</h2></b>
		<a style="background-color: rgb(40, 167, 167);
				color: brown;
				padding: 1em 1.5em;
        text-decoration: none;
        font-weight:bold;
				text-transform: capitalize;" class="btn" href="${url}">Verify Email</a>
	</body>
</html>
  `;
  return html;
}

module.exports = template;

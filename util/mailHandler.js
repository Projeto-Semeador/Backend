require("dotenv").config();
const { MailtrapClient } = require("mailtrap");

class MailHandler {
	#client = new MailtrapClient({
		token: `${process.env.MAILTRAP_TOKEN}` 
	});

	#sender = {
		email: "hello@demomailtrap.com",
		name: "Mailtrap Test",
	};

	sendRecoveryEmail(recipient, token) {
		this.#client.send({
			from: this.#sender,
			to: [{ email: recipient }],
			template_uuid: "dd880d4f-fab7-446e-b706-91fff09e841a",
		        template_variables: {
		          token: `${token}`
		        }
		});
	}
}

module.exports = MailHandler;

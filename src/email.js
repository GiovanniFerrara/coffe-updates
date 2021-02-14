import recipient from "../recipients.json";
const mailjet = require("node-mailjet").connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

export const send = async (text) => {
  return mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "gianmarco.ferrara@gmail.com",
          Name: "Giovanni",
        },
        To: recipient.list,
        TemplateID: 2413952,
        TemplateLanguage: true,
        Subject: "New Coffee for you!",
        Variables: {
          event: text,
        },
      },
    ],
  });
};

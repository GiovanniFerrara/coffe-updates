import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { getProductsDetails } from "./checkProductsUpdates";
import * as email from "./email";
import logger from "./logger";

let app = express();

app.get("/", async (req, res) => {
  const { availableProducts, totalProducts } = await getProductsDetails();
  res.send(`
  Available Products: ${availableProducts},
  Total Products: ${totalProducts}
  `);
});

app.get("/email", async (req, res) => {
  try {
    await email.send("Test email");
    res.send("Emails sent successfully");
  } catch (e) {
    logger.error(e)
    res.status("500").send("Server error");
  }
});

let server = app.listen(process.env.PORT || 3000, () => {
  console.log(
    `server running at port http://localhost/${server.address().port}`
  );
});

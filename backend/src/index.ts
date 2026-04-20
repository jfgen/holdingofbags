import "dotenv/config";
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3001);
createApp().listen(port, () => {
  console.log(`[backend] listening on :${port}`);
});

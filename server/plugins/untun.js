import { startTunnel } from "untun";

export default defineNitroPlugin(async (nitroApp) => {
  //   console.log("Nitro plugin", nitroApp);
  const tunnel = await startTunnel({ port: 3000 });
  const url = await tunnel.getURL();
  console.log("Tunnel URL => ", url);

  await useStorage("tunnel").setItem("url", { url: url });
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/locket.svg"],
      manifest: {
        name: "Locket",
        short_name: "Locket",
        description: "Your private offline diary, encrypted on your device.",
        theme_color: "#6f4da8",
        background_color: "#efe7f8",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "icons/locket.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  server: {
    port: 3000
  }
});

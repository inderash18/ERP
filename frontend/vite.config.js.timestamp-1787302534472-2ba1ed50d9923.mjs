// vite.config.js
import { defineConfig } from "file:///D:/ERP/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/ERP/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/ERP/frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "D:\\ERP\\frontend";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss({
      output: path.resolve(__vite_injected_original_dirname, "dist", "assets", "index.css"),
      config: path.resolve(__vite_injected_original_dirname, "tailwind.config.js"),
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
      ],
      theme: {
        extend: {}
      },
      plugins: []
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxFUlBcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEVSUFxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovRVJQL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICB0YWlsd2luZGNzcyh7XHJcbiAgICAgIG91dHB1dDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2Rpc3QnLCAnYXNzZXRzJywgJ2luZGV4LmNzcycpLFxyXG4gICAgICBjb25maWc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICd0YWlsd2luZC5jb25maWcuanMnKSxcclxuICAgICAgY29udGVudDogW1xyXG4gICAgICAgICcuL2luZGV4Lmh0bWwnLFxyXG4gICAgICAgICcuL3NyYy8qKi8qLntqcyx0cyxqc3gsdHN4fScsXHJcbiAgICAgIF0sXHJcbiAgICAgIHRoZW1lOiB7XHJcbiAgICAgICAgZXh0ZW5kOiB7fSxcclxuICAgICAgfSxcclxuICAgICAgcGx1Z2luczogW10sXHJcbiAgICB9KSxcclxuICBdLFxyXG5cclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDUxNzMsXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQXFPLFNBQVMsb0JBQW9CO0FBQ2xRLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLE1BQ1YsUUFBUSxLQUFLLFFBQVEsa0NBQVcsUUFBUSxVQUFVLFdBQVc7QUFBQSxNQUM3RCxRQUFRLEtBQUssUUFBUSxrQ0FBVyxvQkFBb0I7QUFBQSxNQUNwRCxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDTCxRQUFRLENBQUM7QUFBQSxNQUNYO0FBQUEsTUFDQSxTQUFTLENBQUM7QUFBQSxJQUNaLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

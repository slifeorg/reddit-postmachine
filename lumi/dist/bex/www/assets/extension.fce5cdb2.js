import { b as boot } from "./index.3b1eadad.js";
var extension = boot(({ app, router }) => {
  const isExtension = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;
  if (isExtension) {
    console.log("Running in extension context");
    app.config.globalProperties.$isExtension = true;
    app.config.globalProperties.$chrome = chrome;
    router.beforeEach((to, from, next) => {
      console.log("Extension navigation:", from.path, "->", to.path);
      next();
    });
    app.config.globalProperties.$extensionStorage = {
      async get(key) {
        return new Promise((resolve) => {
          chrome.storage.sync.get([key], (result) => {
            resolve(result[key]);
          });
        });
      },
      async set(key, value) {
        return new Promise((resolve) => {
          chrome.storage.sync.set({ [key]: value }, () => {
            resolve();
          });
        });
      },
      async remove(key) {
        return new Promise((resolve) => {
          chrome.storage.sync.remove([key], () => {
            resolve();
          });
        });
      }
    };
    app.config.globalProperties.$extensionMessage = {
      send(message) {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(message, (response) => {
            resolve(response);
          });
        });
      },
      onMessage(callback) {
        chrome.runtime.onMessage.addListener(callback);
      }
    };
  } else {
    console.log("Running in regular web context");
    app.config.globalProperties.$isExtension = false;
  }
});
export { extension as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLmZjZTVjZGIyLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYm9vdC9leHRlbnNpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBFeHRlbnNpb24gYm9vdCBmaWxlXG4gKiBJbml0aWFsaXplcyBleHRlbnNpb24tc3BlY2lmaWMgZnVuY3Rpb25hbGl0eVxuICovXG5cbmltcG9ydCB7IGJvb3QgfSBmcm9tICdxdWFzYXIvd3JhcHBlcnMnXG5cbmV4cG9ydCBkZWZhdWx0IGJvb3QoKHsgYXBwLCByb3V0ZXIgfSkgPT4ge1xuICAvLyBDaGVjayBpZiBydW5uaW5nIGluIGV4dGVuc2lvbiBjb250ZXh0XG4gIGNvbnN0IGlzRXh0ZW5zaW9uID0gdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY2hyb21lLnJ1bnRpbWUgJiYgY2hyb21lLnJ1bnRpbWUuaWRcblxuICBpZiAoaXNFeHRlbnNpb24pIHtcbiAgICBjb25zb2xlLmxvZygnUnVubmluZyBpbiBleHRlbnNpb24gY29udGV4dCcpXG4gICAgXG4gICAgLy8gQWRkIGV4dGVuc2lvbi1zcGVjaWZpYyBnbG9iYWwgcHJvcGVydGllc1xuICAgIGFwcC5jb25maWcuZ2xvYmFsUHJvcGVydGllcy4kaXNFeHRlbnNpb24gPSB0cnVlXG4gICAgYXBwLmNvbmZpZy5nbG9iYWxQcm9wZXJ0aWVzLiRjaHJvbWUgPSBjaHJvbWVcbiAgICBcbiAgICAvLyBFeHRlbnNpb24tc3BlY2lmaWMgcm91dGVyIG5hdmlnYXRpb24gaGFuZGxpbmdcbiAgICByb3V0ZXIuYmVmb3JlRWFjaCgodG8sIGZyb20sIG5leHQpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdFeHRlbnNpb24gbmF2aWdhdGlvbjonLCBmcm9tLnBhdGgsICctPicsIHRvLnBhdGgpXG4gICAgICBuZXh0KClcbiAgICB9KVxuICAgIFxuICAgIC8vIEluaXRpYWxpemUgZXh0ZW5zaW9uIHN0b3JhZ2UgaGVscGVyXG4gICAgYXBwLmNvbmZpZy5nbG9iYWxQcm9wZXJ0aWVzLiRleHRlbnNpb25TdG9yYWdlID0ge1xuICAgICAgYXN5bmMgZ2V0KGtleSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldChba2V5XSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHRba2V5XSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIFxuICAgICAgYXN5bmMgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoeyBba2V5XTogdmFsdWUgfSwgKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBcbiAgICAgIGFzeW5jIHJlbW92ZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5yZW1vdmUoW2tleV0sICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIEluaXRpYWxpemUgZXh0ZW5zaW9uIG1lc3NhZ2luZ1xuICAgIGFwcC5jb25maWcuZ2xvYmFsUHJvcGVydGllcy4kZXh0ZW5zaW9uTWVzc2FnZSA9IHtcbiAgICAgIHNlbmQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShtZXNzYWdlLCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBcbiAgICAgIG9uTWVzc2FnZShjYWxsYmFjaykge1xuICAgICAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoY2FsbGJhY2spXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdSdW5uaW5nIGluIHJlZ3VsYXIgd2ViIGNvbnRleHQnKVxuICAgIGFwcC5jb25maWcuZ2xvYmFsUHJvcGVydGllcy4kaXNFeHRlbnNpb24gPSBmYWxzZVxuICB9XG59KSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBT0EsSUFBZSxZQUFBLEtBQUssQ0FBQyxFQUFFLEtBQUssYUFBYTtBQUV2QyxRQUFNLGNBQWMsT0FBTyxXQUFXLGVBQWUsT0FBTyxXQUFXLE9BQU8sUUFBUTtBQUV0RixNQUFJLGFBQWE7QUFDZixZQUFRLElBQUksOEJBQThCO0FBRzFDLFFBQUksT0FBTyxpQkFBaUIsZUFBZTtBQUMzQyxRQUFJLE9BQU8saUJBQWlCLFVBQVU7QUFHdEMsV0FBTyxXQUFXLENBQUMsSUFBSSxNQUFNLFNBQVM7QUFDcEMsY0FBUSxJQUFJLHlCQUF5QixLQUFLLE1BQU0sTUFBTSxHQUFHLElBQUk7QUFDN0QsV0FBSztBQUFBLElBQ1gsQ0FBSztBQUdELFFBQUksT0FBTyxpQkFBaUIsb0JBQW9CO0FBQUEsTUFDOUMsTUFBTSxJQUFJLEtBQUs7QUFDYixlQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDOUIsaUJBQU8sUUFBUSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxXQUFXO0FBQ3pDLG9CQUFRLE9BQU8sSUFBSTtBQUFBLFVBQy9CLENBQVc7QUFBQSxRQUNYLENBQVM7QUFBQSxNQUNGO0FBQUEsTUFFRCxNQUFNLElBQUksS0FBSyxPQUFPO0FBQ3BCLGVBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM5QixpQkFBTyxRQUFRLEtBQUssSUFBSSxFQUFFLENBQUMsTUFBTSxNQUFLLEdBQUksTUFBTTtBQUM5QyxvQkFBUTtBQUFBLFVBQ3BCLENBQVc7QUFBQSxRQUNYLENBQVM7QUFBQSxNQUNGO0FBQUEsTUFFRCxNQUFNLE9BQU8sS0FBSztBQUNoQixlQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDOUIsaUJBQU8sUUFBUSxLQUFLLE9BQU8sQ0FBQyxHQUFHLEdBQUcsTUFBTTtBQUN0QyxvQkFBUTtBQUFBLFVBQ3BCLENBQVc7QUFBQSxRQUNYLENBQVM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUdBLFFBQUksT0FBTyxpQkFBaUIsb0JBQW9CO0FBQUEsTUFDOUMsS0FBSyxTQUFTO0FBQ1osZUFBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZO0FBQzlCLGlCQUFPLFFBQVEsWUFBWSxTQUFTLENBQUMsYUFBYTtBQUNoRCxvQkFBUSxRQUFRO0FBQUEsVUFDNUIsQ0FBVztBQUFBLFFBQ1gsQ0FBUztBQUFBLE1BQ0Y7QUFBQSxNQUVELFVBQVUsVUFBVTtBQUNsQixlQUFPLFFBQVEsVUFBVSxZQUFZLFFBQVE7QUFBQSxNQUMvQztBQUFBLElBQ0Y7QUFBQSxFQUNKLE9BQVM7QUFDTCxZQUFRLElBQUksZ0NBQWdDO0FBQzVDLFFBQUksT0FBTyxpQkFBaUIsZUFBZTtBQUFBLEVBQzdDO0FBQ0YsQ0FBQzs7In0=

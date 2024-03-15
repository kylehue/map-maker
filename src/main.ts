import { createApp } from "vue";
import "./assets/styles/index.css";
import App from "./main.vue";
import { createPinia } from "pinia";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.directive("drag-slider", {
   mounted(el, binding) {
      if (!(el instanceof HTMLElement)) {
         console.warn(
            "[drag-slider]: Make sure that the element is an instance of HTMLElement."
         );
         return;
      }

      if (typeof binding.value != "function") {
         console.warn(
            "[drag-slider]: Make sure that you pass a callback function."
         );
         return;
      }
      

      let isDown = false;
      el.addEventListener("mousedown", (e) => {
         isDown = true;
      });

      addEventListener("mousemove", (e) => {
         if (!isDown) return;
         binding.value(e.movementX, e.movementY);
      });

      addEventListener("mouseup", () => {
         isDown = false;
      });
      document.addEventListener("mouseleave", () => {
         isDown = false;
      });
   },
});

app.mount("#app");
import { DEFAULT_IMAGE } from "../config/constants.js";
import { PauseIcon, PlayIcon } from "../utils/icons.js";
import { getMeta } from "../utils/getMeta.js";
import { obtenerCaratulaDeezer } from "../utils/obtenerCaratulaDeezer.js";

export const RadioController = {
  postRender: function () {
    this.audio = document.querySelector("audio");
  },
  controller: function () {
    this.meta = null;
    this.audio = null;

    this.toggleAudio = function () {
      this.audio.paused ? this.audio.play() : this.audio.pause();
      this.apply();
    };

    const updateMeta = async () => {
      try {
        const response = await getMeta();
        const newMeta = response.data.information.category.meta;

        if (this.meta && this.meta.title === newMeta.title && this.meta.artist === newMeta.artist) return;

        this.meta = { ...newMeta, image: this.meta?.image || null };
        this.apply();

        const caratula = await obtenerCaratulaDeezer(this.meta.album, this.meta.artist).catch(() => DEFAULT_IMAGE);
        if (this.meta.image !== caratula) {
          this.meta.image = caratula;
          this.apply();
        }
      } catch (error) {
        console.error("Error al obtener metadata:", error);
      }
    };

    this.interval = setInterval(updateMeta, 10000);

    this.onDestroy = function () {
      clearInterval(this.interval);
      this.audio?.pause();
    };

    updateMeta();
  },
  render: function () {
    const { artist, title, image } = this.meta || {};
    const isPaused = this.audio?.paused ?? true;

    return /* HTML */ `
      <div class="radio">
        ${this.meta
          ? /* HTML */ `
              ${image ? `<img src="${image}" />` : ""}
              <div class="meta">
                <div onclick="toggleAudio" class="player">${isPaused ? PlayIcon() : PauseIcon()}</div>
                <h1 class="title">${title || "Unknown Title"}</h1>
                <p class="artist">${artist || "Unknown Artist"}</p>
              </div>
            `
          : ""}
      </div>

      <audio src="https://pablomsj.com/radio.mp3"></audio>
    `;
  },
};

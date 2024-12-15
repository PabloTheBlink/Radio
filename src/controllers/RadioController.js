import { DEFAULT_IMAGE } from "../config/constants.js";
import { PauseIcon, PlayIcon } from "../utils/icons.js";
import { getMeta } from "../utils/getMeta.js";
import { obtenerCaratulaDeezer } from "../utils/obtenerCaratulaDeezer.js";

// # Todo
// - [x] Si se pausa, y se reanuda mas tarde, hace buffering, y no corresponde a la metadata actual
// - [x] Activar animacion solo si se esta reproduciendo
// - [ ] Recucir opacidad del pause al segundo

export const RadioController = {
  postRender: function () {
    this.audio = document.querySelector("audio");
  },
  controller: function () {
    this.meta = null;
    this.audio = null;

    this.toggleAudio = function () {
      if (!this.audio.src) this.audio.src = RADIO_URL;
      this.audio.paused ? this.audio.play() : this.audio.pause();
      if (this.audio.paused) {
        this.audio.src = "";
        this.audio.currentTime = 0;
      }
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

          if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: this.meta.title,
              artist: this.meta.artist,
              album: this.meta.album,
              artwork: [{ src: this.meta.image, sizes: "256x256", type: "image/png" }],
            });

            navigator.mediaSession.setActionHandler("play", () => {
              this.audio.play();
              this.apply();
            });
            navigator.mediaSession.setActionHandler("pause", () => {
              this.audio.pause();
              this.apply();
            });
          }
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
      <div class="radio ${!isPaused ? "playing" : ""}">
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

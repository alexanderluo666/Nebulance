import ambient1 from "../assets/Ambient1.mp3";
import ambient2 from "../assets/Ambient2.mp3";
import ambient3 from "../assets/Ambient3.mp3";
import ambient4 from "../assets/Ambient4.mp3";
import ambient5 from "../assets/Ambient5.mp3";
import ambient6 from "../assets/Ambient6.mp3";
import ambient7 from "../assets/Ambient7.mp3";
import ambient8 from "../assets/Ambient8.mp3";
import ambient9 from "../assets/Ambient9.mp3";
import ambient10 from "../assets/Ambient10.mp3";
import ambient11 from "../assets/Ambient11.mp3";
import ship1Url from "../assets/Ship1.mp3";
import ship2Url from "../assets/Ship2.mp3";
import laserUrl from "../assets/laser1.mp3";
import { audioConfig } from "../data/worldConfig";

const ambientTracks = [
  ambient1,
  ambient2,
  ambient3,
  ambient4,
  ambient5,
  ambient6,
  ambient7,
  ambient8,
  ambient9,
  ambient10,
  ambient11,
];

function pickRandomAmbientIndex(exclude = -1): number {
  if (ambientTracks.length <= 1) return 0;
  let index = Math.floor(Math.random() * ambientTracks.length);
  while (index === exclude) {
    index = Math.floor(Math.random() * ambientTracks.length);
  }
  return index;
}

class GameAudio {
  private ambient: HTMLAudioElement | null = null;
  private engine: HTMLAudioElement | null = null;
  private boost: HTMLAudioElement | null = null;
  private unlocked = false;
  private active = false;
  private lastAmbientIndex = -1;
  private readonly onAmbientEnded = () => {
    if (this.active && this.unlocked) {
      this.playRandomAmbient();
    }
  };

  private unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.ambient?.play().catch(() => {});
    this.engine?.play().catch(() => {});
  }

  private playRandomAmbient() {
    const index = pickRandomAmbientIndex(this.lastAmbientIndex);
    this.lastAmbientIndex = index;

    if (this.ambient) {
      this.ambient.removeEventListener("ended", this.onAmbientEnded);
      this.ambient.pause();
    }

    this.ambient = new Audio(ambientTracks[index]);
    this.ambient.volume = audioConfig.ambientVolume;
    this.ambient.addEventListener("ended", this.onAmbientEnded);
    if (this.unlocked) {
      this.ambient.play().catch(() => {});
    }
  }

  start() {
    if (this.active && this.ambient) return;
    this.stop();
    this.active = true;
    this.lastAmbientIndex = -1;
    this.playRandomAmbient();

    this.engine = new Audio(ship1Url);
    this.engine.loop = true;
    this.engine.volume = audioConfig.engineVolume;

    this.boost = new Audio(ship2Url);
    this.boost.loop = true;
    this.boost.volume = audioConfig.boostVolume;

    if (this.unlocked) {
      this.engine.play().catch(() => {});
    }
  }

  onUserGesture() {
    this.unlock();
  }

  playLaser() {
    const sfx = new Audio(laserUrl);
    sfx.volume = audioConfig.laserVolume;
    if (this.unlocked) {
      sfx.play().catch(() => {});
    }
  }

  setBoosting(boosting: boolean) {
    if (!this.boost || !this.unlocked) return;
    if (boosting) {
      if (this.boost.paused) {
        this.boost.currentTime = 0;
        this.boost.play().catch(() => {});
      }
    } else if (!this.boost.paused) {
      this.boost.pause();
    }
  }

  stop() {
    this.active = false;
    if (this.ambient) {
      this.ambient.removeEventListener("ended", this.onAmbientEnded);
    }
    [this.ambient, this.engine, this.boost].forEach((a) => {
      if (!a) return;
      a.pause();
      a.currentTime = 0;
    });
    this.ambient = null;
    this.engine = null;
    this.boost = null;
    this.lastAmbientIndex = -1;
  }
}

export const gameAudio = new GameAudio();

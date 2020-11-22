let firstInput: boolean = false;

export function afterInput() {
  // On iOS audio only becomes available after first user input
  // This method is called from canvas and webgl renders as UI events
  // originate there
  if (!firstInput) {
    firstInput = true;
    const iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
    if (iOS) {
      try {
        changeColorAudio.play();
      } catch (e) {}
    }
  }
}

export const explosionAudio: ISound = initSound(
  'resources/audio/effects/explosion.mp3'
);
export const appearAudio: ISound = initSound(
  'resources/audio/effects/appear.mp3'
);
export const changeColorAudio: ISound = initSound(
  'resources/audio/effects/changecolor.mp3'
);
export const laserAudio: ISound = initSound(
  'resources/audio/effects/laser.mp3'
);

function loadSound(
  url: string,
  ctx: AudioContext,
  onSuccess: (b: AudioBuffer) => void,
  onError: () => void
) {
  const request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer'; // Important trick
  request.onload = () => {
    ctx.decodeAudioData(
      request.response,
      (buffer: AudioBuffer) => {
        onSuccess(buffer);
      },
      () => {
        onError();
      }
    );
  };
  request.send();
}

function playSound(ctx: AudioContext, buffer: AudioBuffer) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
}

interface ISound {
  url: string;
  play: () => void;
  init: () => any;
}

function initSound(url: string): ISound {
  const audioContext = new AudioContext();
  const result = {
    init: () => {
      loadSound(
        result.url,
        audioContext,
        (buffer: AudioBuffer) => {
          result.play = () => {
            playSound(audioContext, buffer);
          };
        },
        () => {}
      );
    },
    play: () => {},
    url,
  };
  result.init();
  return result;
}

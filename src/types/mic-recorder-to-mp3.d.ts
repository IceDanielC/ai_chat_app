declare module "mic-recorder-to-mp3" {
  class MicRecorder {
    constructor(config?: {
      bitRate?: number;
      sampleRate?: number;
      mimeType?: string;
    });

    start(): Promise<void>;
    stop(): any;
    getMp3(): Promise<Blob>;
  }

  export default MicRecorder;
}

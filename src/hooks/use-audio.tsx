import { useRef, useState } from 'react';

export const useRecordVoice = () => {
  // State to hold the media recorder instance
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  // State to track whether recording is currently in progress
  const [recording, setRecording] = useState<
    'initial' | 'play' | 'pause' | 'stop'
  >('initial');
  // State to store the audio blob
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  // State to store the audio file
  const [audioFile, setAudioFile] = useState<File | null>(null);
  // Ref to store audio chunks during recording
  const chunks = useRef<Blob[]>([]);

  // Function to start the recording
  const startRecording = (): void => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording('play');
    }
  };

  const pauseRecording = (): void => {
    if (mediaRecorder) {
      mediaRecorder.pause();
      setRecording('pause');
    }
  };

  const resumeRecording = (): void => {
    if (mediaRecorder) {
      mediaRecorder.resume();
      setRecording('play');
    }
  };

  // Function to stop the recording
  const stopRecording = (): void => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording('stop');
    }
  };

  const initialMediaRecorder = (stream: MediaStream): void => {
    const recorder = new MediaRecorder(stream);

    // Event handler when recording starts
    recorder.onstart = () => {
      chunks.current = []; // Reset chunks when recording starts
      setRecording('play');
    };

    // Event handler when data becomes available during recording
    recorder.ondataavailable = (ev: BlobEvent) => {
      console.log('data available', ev);
      chunks.current.push(ev.data); // Storing data chunks
      // Create a blob from the accumulated audio chunks with WAV format
      const audioBlob = new Blob(chunks.current, { type: 'audio/wav' });
      const audioFile = new File([audioBlob], 'audio.wav', {
        type: 'audio/wav',
      });
      // Set the file and blob in your state
      setAudioFile(audioFile);
      setAudioBlob(audioBlob);
    };

    // Event handler when recording stops
    recorder.onstop = () => {
      const finalBlob = new Blob(chunks.current, { type: 'audio/wav' });
      const finalFile = new File([finalBlob], 'audio.wav', {
        type: 'audio/wav',
      });
      // Handle the final audio data after stopping
      setAudioFile(finalFile);
      setAudioBlob(finalBlob);
      setRecording('stop');
    };

    recorder.onpause = () => {
      setRecording('pause');
    };

    recorder.onresume = () => {
      setRecording('play');
    };

    recorder.start(3000);
    setMediaRecorder(recorder);
  };

  const resetRecorder = (): void => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.ondataavailable = null;
      mediaRecorder.onstop = null;
      mediaRecorder.onstart = null;
      mediaRecorder.onpause = null;
      mediaRecorder.onresume = null;
      setMediaRecorder(null);
      setRecording('initial');
    }
    setAudioBlob(null);
    setAudioFile(null);
  };

  const reInitiateRecording = (): void => {
    if (typeof window !== 'undefined') {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder);
    }
  };

  // The commented useEffect block is kept for reference
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     navigator.mediaDevices
  //       .getUserMedia({ audio: true })
  //       .then(initialMediaRecorder);
  //   }
  // }, []);

  const askForPermission = (): void => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(initialMediaRecorder);
  };

  return {
    recording,
    setRecording,
    startRecording,
    stopRecording,
    mediaRecorder,
    setMediaRecorder,
    audioBlob,
    setAudioBlob,
    audioFile,
    pauseRecording,
    resumeRecording,
    reInitiateRecording,
    askForPermission,
    resetRecorder,
  };
};

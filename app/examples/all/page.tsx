"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import Chat from "../../components/chat";
import WeatherWidget from "../../components/weather-widget";
import { getWeather } from "../../utils/weather";
import FileViewer from "../../components/file-viewer";
import { textToSpeech, speechToText } from "../../utils/openai-utils";
import { Mic, MicOff } from 'lucide-react';

const FunctionCalling = () => {
  const [weatherData, setWeatherData] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]); // Added state for messages
  const [inputDisabled, setInputDisabled] = useState(false); // Added state for input disable
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const functionCallHandler = async (call) => {
    if (call?.function?.name !== "get_weather") return;
    const args = JSON.parse(call.function.arguments);
    const data = getWeather(args.location);
    setWeatherData(data);
    return JSON.stringify(data);
  };

  const handleSubmit = async (userInput: string) => {
    setInputDisabled(true); // Disable input while processing
    setMessages([...messages, { role: "user", content: userInput }]);
    // ... (Your existing logic to handle user input and update messages) ...
    setInputDisabled(false); // Re-enable input after processing
  };


  const handleVoiceInput = async () => {
    setIsListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioBuffer = await audioBlob.arrayBuffer();
        const userInput = await speechToText(Buffer.from(audioBuffer));
        handleSubmit(userInput); // Pass transcribed text to handleSubmit
      });

      mediaRecorder.start();
      await new Promise(resolve => setTimeout(resolve, 5000)); // Record for 5 seconds
      mediaRecorder.stop();
    } catch (error) {
      console.error("Error recording audio:", error);
    } finally {
      setIsListening(false);
    }
  };

  const speakResponse = async (text: string) => {
    const audioBuffer = await textToSpeech(text);
    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mp3' }));
      audioRef.current.play();
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
          <WeatherWidget {...weatherData} />
          <FileViewer />
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat 
              messages={messages} 
              handleSubmit={handleSubmit} 
              inputDisabled={inputDisabled}
              functionCallHandler={functionCallHandler} 
              onResponse={speakResponse}
            />
          </div>
          <button 
            onClick={handleVoiceInput} 
            disabled={isListening}
            className={styles.voiceButton}
          >
            {isListening ? <MicOff /> : <Mic />}
          </button>
        </div>
      </div>
    </main>
  );
};

export default FunctionCalling;


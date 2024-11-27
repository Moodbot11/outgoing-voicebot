"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import { Mic, MicOff, Send } from 'lucide-react';
import OpenAI from "openai";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState(null);
  const chatContainerRef = useRef(null);
  const threadRef = useRef(null);
  const openaiRef = useRef(null);

  useEffect(() => {
    const initializeOpenAI = async () => {
      try {
        const response = await fetch('/api/get-openai-key');
        if (!response.ok) {
          throw new Error('Failed to fetch OpenAI API key');
        }
        const { apiKey } = await response.json();
        openaiRef.current = new OpenAI({ apiKey });
        const thread = await openaiRef.current.beta.threads.create();
        threadRef.current = thread;
        console.log("Thread created:", thread.id);
      } catch (error) {
        console.error('Error initializing OpenAI:', error);
        setError('Failed to initialize chat. Please try again later.');
      }
    };

    initializeOpenAI();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      await processUserInput(userInput);
      setUserInput(""); // Clear the input after sending
    }
  };

  const processUserInput = async (input) => {
    if (!openaiRef.current || !threadRef.current) {
      setError('Chat is not initialized. Please try again later.');
      return;
    }

    setInputDisabled(true);
    const userMessage = { role: "user", content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      // Add the user's message to the thread
      await openaiRef.current.beta.threads.messages.create(threadRef.current.id, {
        role: "user",
        content: input
      });

      // Run the assistant
      const run = await openaiRef.current.beta.threads.runs.create(threadRef.current.id, {
        assistant_id: process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID
      });

      // Wait for the run to complete
      let runStatus = await openaiRef.current.beta.threads.runs.retrieve(threadRef.current.id, run.id);
      while (runStatus.status !== "completed") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openaiRef.current.beta.threads.runs.retrieve(threadRef.current.id, run.id);
      }

      // Retrieve the assistant's messages
      const messages = await openaiRef.current.beta.threads.messages.list(threadRef.current.id);
      const assistantMessage = messages.data.find(message => message.role === "assistant");

      if (assistantMessage) {
        const messageContent = assistantMessage.content.reduce((acc, content) => {
          if (content.type === 'text') {
            return acc + content.text.value;
          }
          return acc;
        }, '');

        setMessages(prevMessages => [...prevMessages, { role: "assistant", content: messageContent }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "Sorry, there was an error processing your request." }]);
    } finally {
      setInputDisabled(false);
      scrollToBottom();
    }
  };

  const handleVoiceInput = async () => {
    setIsListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], "audio.wav", { type: 'audio/wav' });

        try {
          const transcription = await openaiRef.current.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
          });

          await processUserInput(transcription.text);
        } catch (error) {
          console.error("Error transcribing audio:", error);
          setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "Sorry, there was an error processing your voice input." }]);
        }
      });

      mediaRecorder.start();
      await new Promise(resolve => setTimeout(resolve, 5000)); // Record for 5 seconds
      mediaRecorder.stop();
    } catch (error) {
      console.error("Error recording audio:", error);
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "Sorry, there was an error with the voice recording." }]);
    } finally {
      setIsListening(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.chatContainer}>
          <div className={styles.chat} ref={chatContainerRef}>
            {messages.map((message, index) => (
              <div key={index} className={`${styles.message} ${styles[message.role]}`}>
                {message.content}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className={styles.inputContainer}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              disabled={inputDisabled}
              className={styles.textInput}
            />
            <button 
              type="submit"
              disabled={inputDisabled || !userInput.trim()}
              className={styles.sendButton}
            >
              <Send size={20} />
            </button>
            <button 
              type="button"
              onClick={handleVoiceInput} 
              disabled={isListening || inputDisabled}
              className={styles.voiceButton}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Home;


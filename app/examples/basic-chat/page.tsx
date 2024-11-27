"use client";

import React, { useState, useRef } from "react";
import styles from "./page.module.css";
import { Mic, MicOff, Send } from 'lucide-react';
import { speechToText } from "../../utils/openai-utils";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const chatContainerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      await processUserInput(userInput);
      setUserInput(""); // Clear the input after sending
    }
  };

  const processUserInput = async (input) => {
    setInputDisabled(true);
    setMessages(prevMessages => [...prevMessages, { role: "user", content: input }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: input }] }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      setMessages(prevMessages => [...prevMessages, data.choices[0].message]);
      onResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "Sorry, there was an error processing your request." }]);
    } finally {
      setInputDisabled(false);
      scrollToBottom();
    }
  };

  const onResponse = (response) => {
    console.log("Assistant response:", response);
    // Here you could add text-to-speech functionality if desired
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
        const audioBuffer = await audioBlob.arrayBuffer();
        const transcribedInput = await speechToText(Buffer.from(audioBuffer));
        await processUserInput(transcribedInput);
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

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

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
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              disabled={inputDisabled}
              className={styles.textInput}
            />
            <button 
              onClick={handleSubmit}
              disabled={inputDisabled || !userInput.trim()}
              className={styles.sendButton}
            >
              <Send size={20} />
            </button>
            <button 
              onClick={handleVoiceInput} 
              disabled={isListening || inputDisabled}
              className={styles.voiceButton}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;


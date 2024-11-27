"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Chat from "../../components/chat";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userInput = e.target.userInput.value;
    if (userInput.trim()) {
      setMessages([...messages, { role: "user", content: userInput }]);
      // Here you would typically send the message to your API
      // For now, we'll just echo the message back
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { role: "assistant", content: `You said: ${userInput}` }]);
      }, 1000);
    }
  };

  const functionCallHandler = () => {
    // Implement if needed for basic chat
  };

  const onResponse = (response) => {
    // Implement if needed for basic chat
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Chat 
          messages={messages}
          handleSubmit={handleSubmit}
          inputDisabled={inputDisabled}
          functionCallHandler={functionCallHandler}
          onResponse={onResponse}
        />
      </div>
    </main>
  );
};

export default Home;


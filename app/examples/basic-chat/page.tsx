"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Chat from "../../components/chat";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userInput = e.target.userInput.value;
    if (userInput.trim()) {
      setInputDisabled(true);
      setMessages(prevMessages => [...prevMessages, { role: "user", content: userInput }]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, { role: "user", content: userInput }] }),
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, data.choices[0].message]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "Sorry, there was an error processing your request." }]);
      } finally {
        setInputDisabled(false);
      }
    }
  };

  const functionCallHandler = () => {
    // Not used in basic chat, but required by Chat component
  };

  const onResponse = (response) => {
    console.log("Assistant response:", response);
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


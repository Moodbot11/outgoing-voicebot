"use client";

import React, { useState } from "react";
import styles from "../shared/page.module.css";
import Chat from "../../components/chat";
import FileViewer from "../../components/file-viewer";

const FileSearchPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userInput = e.target.userInput.value;
    if (userInput.trim()) {
      setMessages([...messages, { role: "user", content: userInput }]);
      // Here you would typically send the message to your API for file search
      // For now, we'll just echo the message back
      setInputDisabled(true);
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { role: "assistant", content: `Searching for: ${userInput}` }]);
        setInputDisabled(false);
      }, 1000);
    }
  };

  const functionCallHandler = (call) => {
    // Implement file search functionality if needed
    console.log("Function call received:", call);
  };

  const onResponse = (response) => {
    // Handle the response from the assistant
    console.log("Assistant response:", response);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
          <FileViewer />
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat 
              messages={messages}
              handleSubmit={handleSubmit}
              inputDisabled={inputDisabled}
              functionCallHandler={functionCallHandler}
              onResponse={onResponse}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default FileSearchPage;


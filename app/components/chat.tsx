import React, { useState, useRef, useEffect } from 'react';
import styles from '../app/page.module.css';
import { Mic, MicOff } from 'lucide-react';
import { speechToText } from "../utils/openai-utils";

const Message = ({ role, text }) => {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      {text}
    </div>
  );
};

const Chat = ({ messages, handleSubmit, handleVoiceInput, inputDisabled, isListening }) => {
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className={`${styles.inputForm} ${styles.clearfix}`}
      >
        <input
          type="text"
          className={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your question"
          disabled={inputDisabled}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={inputDisabled}
        >
          Send
        </button>
        <button
          type="button"
          className={styles.voiceButton}
          onClick={handleVoiceInput}
          disabled={isListening || inputDisabled}
        >
          {isListening ? <MicOff /> : <Mic />}
        </button>
      </form>
    </div>
  );
};

export default Chat;


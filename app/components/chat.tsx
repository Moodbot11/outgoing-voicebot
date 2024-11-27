import React, { useState, useRef, useEffect } from 'react';
import styles from '../page.module.css';
import { Mic, MicOff } from 'lucide-react';
import { speechToText } from "../../utils/openai-utils";

const Message = ({ role, text }) => {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      {text}
    </div>
  );
};

const Chat = ({ messages, handleSubmit, inputDisabled }) => {
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        const userInput = await speechToText(Buffer.from(audioBuffer));
        setUserInput(userInput);
        handleSubmit({ preventDefault: () => {}, target: { userInput: { value: userInput } } });
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

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
    setUserInput('');
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.content} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={onSubmit} className={styles.inputForm}>
        <input
          type="text"
          name="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          disabled={inputDisabled}
          className={styles.input}
        />
        <button type="submit" disabled={inputDisabled} className={styles.button}>
          Send
        </button>
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={isListening || inputDisabled}
          className={styles.voiceButton}
        >
          {isListening ? <MicOff /> : <Mic />}
        </button>
      </form>
    </div>
  );
};

export default Chat;


"use client";

import React, { useState } from "react";
import styles from "../shared/page.module.css";
import Chat from "../../components/chat";
import WeatherWidget from "../../components/weather-widget";
import { getWeather } from "../../utils/weather";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";

interface WeatherData {
  location?: string;
  temperature?: number;
  conditions?: string;
}

const FunctionCalling = () => {
  const [weatherData, setWeatherData] = useState<WeatherData>({});
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const isEmpty = Object.keys(weatherData).length === 0;

  const functionCallHandler = async (call: RequiredActionFunctionToolCall) => {
    if (call?.function?.name !== "get_weather") return;
    const args = JSON.parse(call.function.arguments);
    const data = getWeather(args.location);
    setWeatherData(data);
    return JSON.stringify(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userInput = e.target.userInput.value;
    if (userInput.trim()) {
      setMessages([...messages, { role: "user", content: userInput }]);
      setInputDisabled(true);
      // Simulate API call
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { role: "assistant", content: `Processing your request: ${userInput}` }]);
        setInputDisabled(false);
      }, 1000);
    }
  };

  const onResponse = (response) => {
    // Handle the response from the assistant
    console.log("Assistant response:", response);
    setMessages(prevMessages => [...prevMessages, { role: "assistant", content: response }]);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
          <WeatherWidget
            location={weatherData.location || "---"}
            temperature={weatherData.temperature?.toString() || "---"}
            conditions={weatherData.conditions || "Sunny"}
            isEmpty={isEmpty}
          />
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

export default FunctionCalling;


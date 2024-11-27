"use client";

import React, { useState } from "react";
import styles from "../page.module.css";

const TwilioCallPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("");

  const handleCall = async () => {
    setStatus("Initiating call...");
    try {
      const response = await fetch("/api/twilio/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (data.success) {
        setStatus(`Call initiated successfully. Call SID: ${data.callSid}`);
      } else {
        setStatus(`Failed to initiate call: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.title}>Twilio Outbound Call</div>
      <div className={styles.container}>
        <input
          type="tel"
          placeholder="Enter phone number (e.g., +1234567890)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleCall} className={styles.category}>
          Make Call
        </button>
        {status && <p className={styles.status}>{status}</p>}
      </div>
      <a href="/" className={styles.backLink}>
        Back to Home
      </a>
    </main>
  );
};

export default TwilioCallPage;


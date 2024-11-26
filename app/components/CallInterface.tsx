'use client'

import { useState } from 'react'

export function CallInterface() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [status, setStatus] = useState('')

  const handleCall = async () => {
    setStatus('Initiating call...')
    try {
      const response = await fetch('/api/twilio/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      })
      const data = await response.json()
      if (data.success) {
        setStatus(`Call initiated successfully. Call SID: ${data.callSid}`)
      } else {
        setStatus(`Failed to initiate call: ${data.error}`)
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <input
        type="tel"
        placeholder="Enter phone number (e.g., +1234567890)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
      <button 
        onClick={handleCall} 
        className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Make Call
      </button>
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </div>
  )
}


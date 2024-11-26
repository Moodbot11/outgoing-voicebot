import { CallInterface } from './components/CallInterface'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Outgoing Voice Bot</h1>
      
      {/* Existing chat interface */}
      <div className="mb-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Explore sample apps built with Assistants API</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">Basic chat</button>
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">Function calling</button>
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">File search</button>
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">All</button>
        </div>
      </div>
      
      {/* New Twilio call interface */}
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Make an Outbound Call</h2>
        <CallInterface />
      </div>
    </main>
  )
}


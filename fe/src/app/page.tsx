import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-black to-red-800">
      <div className="text-center text-white px-6">
        <h1 className="text-6xl font-bold mb-4">Welcome to Nexus</h1>
        <p className="text-xl mb-8 opacity-90">Connect with your SDSU community</p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth"
            className="bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

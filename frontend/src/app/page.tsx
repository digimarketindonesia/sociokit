export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">SocioKit</h1>
        <p className="text-2xl mb-8">Social Media Management Platform</p>
        <div className="space-x-4">
          <a 
            href="/sign-in" 
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Sign In
          </a>
          <a 
            href="/sign-up" 
            className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-6">SocioTools</h1>
          <p className="text-xl mb-8">
            Platform Manajemen Media Sosial Terlengkap
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/sign-in"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Masuk
            </a>
            <a
              href="/sign-up"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Daftar Sekarang
            </a>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-white">
          <div className="text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Auto Post</h3>
            <p>Posting otomatis ke grup & fanpage Facebook</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Shortlink</h3>
            <p>Buat shortlink dengan routing & cloaking</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Affiliate</h3>
            <p>Dapatkan komisi dari setiap referral</p>
          </div>
        </div>
      </div>
    </div>
  );
}

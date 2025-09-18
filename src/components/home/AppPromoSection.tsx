import Image from "next/image";

export default function AppPromoSection() {
  return (
    <section className="py-8">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-white p-5 flex items-center gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Get the WholesaleHub app</h2>
          <p className="text-sm text-gray-600 mb-3">Shop smarter with personalized recommendations and faster checkout.</p>
          <div className="flex items-center gap-3">
            <div className="w-24 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
              <div className="w-20 h-20 bg-[radial-gradient(circle,#4f46e5_0%,#fff_60%)] rounded" aria-hidden />
            </div>
            <div className="space-y-2">
              <a href="#" className="inline-flex items-center justify-center rounded-lg bg-black text-white text-xs font-semibold px-3 py-2">App Store</a>
              <a href="#" className="inline-flex items-center justify-center rounded-lg bg-black text-white text-xs font-semibold px-3 py-2">Google Play</a>
            </div>
          </div>
        </div>
        <div className="relative hidden sm:block w-40 h-40">
          <Image src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop&crop=center" alt="App preview" fill className="object-cover rounded-xl border border-indigo-100" />
        </div>
      </div>
    </section>
  );
}

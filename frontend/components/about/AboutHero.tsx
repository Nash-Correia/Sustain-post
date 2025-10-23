export default function AboutHero() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-teal-900">About IiAS Sustain</h1>
          <p className="mt-3 text-gray-600 text-lg">Our mission is to advance governance and ESG outcomes through transparent research and practical tools for Indian markets.</p>
        </div>
        <div className="rounded-3xl border border-gray-200 p-6">
          <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 grid place-items-center">
            <span className="text-sm text-teal-900/70">Mission • Team • Impact</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ValuesList() {
  const values = [
    { t: "Independence", d: "Research objectivity and clear conflict management." },
    { t: "Transparency", d: "Methodology and indicator-level clarity." },
    { t: "Materiality", d: "Focus on factors that matter for outcomes." },
    { t: "Stewardship", d: "Support long-term value creation and accountability." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl font-semibold text-teal-900">Our Values</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <div key={v.t} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-teal-900 font-semibold">{v.t}</div>
            <div className="mt-1 text-sm text-gray-600">{v.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

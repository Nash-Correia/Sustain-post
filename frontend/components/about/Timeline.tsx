export default function Timeline() {
  const items = [
    { y: "2010", e: "Foundational governance advisory established." },
    { y: "2015", e: "Coverage extended; sector mapping matured." },
    { y: "2021", e: "Methodology refresh; stewardship toolkit." },
    { y: "2025", e: "IiAS Sustain subsidiary website launch." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl font-semibold text-teal-900">Milestones</h2>
      <ol className="mt-4 space-y-3">
        {items.map((x) => (
          <li key={x.y} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">{x.y}</div>
            <div className="text-sm text-gray-700">{x.e}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}

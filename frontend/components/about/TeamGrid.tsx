
export default function TeamGrid() {
  const team = [
    { name: "Member One", role: "Research Lead" },
    { name: "Member Two", role: "Stewardship Advisor" },
    { name: "Member Three", role: "Methodology" },
    { name: "Member Four", role: "Engineering" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl font-semibold text-teal-900">Team</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((m) => (
          <article key={m.name} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200" />
            <div className="mt-3 font-semibold text-teal-900">{m.name}</div>
            <div className="text-sm text-gray-600">{m.role}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

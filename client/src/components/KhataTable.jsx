export default function KhataTable({ parties = [] }) {
  return (
    <section className="panel">
      <div className="section-head">
        <h2>📒 Udhaar / Khata</h2>
        <span>{parties.length} grahak</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Grahak</th>
              <th>Baaki</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td className="money">
                  ₹{Number(p.balance).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
            {!parties.length && (
              <tr>
                <td colSpan="2" className="muted">
                  Abhi koi khata nahi hai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

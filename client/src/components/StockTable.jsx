export default function StockTable({ items = [] }) {
  return (
    <section className="panel">
      <div className="section-head">
        <h2>📦 Stock</h2>
        <span>{items.length} items</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i._id}>
                <td>{i.name}</td>
                <td>
                  {i.qty} {i.unit}
                </td>
                <td>
                  {i.toBuy ? (
                    <span className="buy-tag">Mangwana hai</span>
                  ) : (
                    <span className="ok-tag">Theek hai</span>
                  )}
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan="3" className="muted">
                  Stock list khaali hai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

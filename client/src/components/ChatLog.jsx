
import { useEffect, useRef } from "react";

export default function ChatLog({ messages = [] }) {
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  return (
    <section className="panel chat-panel">
      <div className="section-head">
        <h2>Munshi se baat</h2>
        <span className="live-dot">● Live</span>
      </div>

      <div className="chat-log">
        {messages.length === 0 ? (
          <p className="muted empty">
            Aap bolkar ya likhkar shuru kar sakte hain.
          </p>
        ) : (
          messages.map((m, i) => (
            <article className="message" key={i}>
              <small>{m.time}</small>

              {m.transcript && (
                <p className="heard">Aap: {m.transcript}</p>
              )}

              <p className="reply">Munshi: {m.reply}</p>
            </article>
          ))
        )}

        <div ref={end} />
      </div>
    </section>
  );
}

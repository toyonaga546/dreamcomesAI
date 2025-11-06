import React, { useEffect, useState } from 'react';
import DreamForm from '../components/DreamForm';
import { getUsername, getDream, clearUsername } from '../lib/auth';
import { useRouter } from 'next/router';

export default function DreamPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const u = getUsername();
    if (!u) {
      router.replace('/');
      return;
    }
    setUsername(u);
    setSaved(getDream());
  }, []);

  function handleLogout() {
    clearUsername();
    router.push('/');
  }

  return (
    <div className="container">
      <main className="card">
        <h1>{username ?? ""}さんの夢日記</h1>

        <DreamForm initialValue={saved} onSaved={(v) => setSaved(v)} />

        {saved && (
          <section className="saved">
            <h2>最後に確定した夢</h2>
            <p>{saved}</p>
          </section>
        )}

        <div style={{ marginTop: 12 }}>
          <button className="btn ghost" onClick={handleLogout}>ログアウト</button>
        </div>
      </main>
    </div>
  );
}

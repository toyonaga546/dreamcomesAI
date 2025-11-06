import React, { useEffect } from 'react';
import Login from '../components/Login';
import { getUsername } from '../lib/auth';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const u = getUsername();
    if (u) router.replace('/dream');
  }, []);

  return (
    <div className="container">
      <main className="card">
        <h1>夢日記へようこそ</h1>
        <Login />
      </main>
    </div>
  );
}

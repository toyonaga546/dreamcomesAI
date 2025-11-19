import { useEffect, useState } from 'react';

// supabaseをインポート
import { supabase } from '../utils/supabase';

const Header = () => {
  const [currentUser, setcurrentUser] = useState('');

    // 現在ログインしているユーザーを取得する処理
  const getCurrentUser = async () => {
    // ログインのセッションを取得する処理
    const { data } = await supabase.auth.getSession()
    // セッションがあるときだけ現在ログインしているユーザーを取得する
    if (data.session !== null) {
      // supabaseに用意されている現在ログインしているユーザーを取得する関数
      const { data: { user } } = await supabase.auth.getUser()
      // 優先して user_metadata の nickname を表示。なければメールアドレスを表示
      const nickname = (user && user.user_metadata && user.user_metadata.nickname) ? user.user_metadata.nickname : (user ? user.email : '')
      setcurrentUser(nickname)
    }
  }

  // HeaderコンポーネントがレンダリングされたときにgetCurrentUser関数が実行される
  useEffect(()=>{
    getCurrentUser()
  },[])

  return (
    <div style={{ padding: "1rem" }} >
      { currentUser ? (
        // サーバーサイドとクライアントサイドでレンダーされる内容が違うときにエラーがでないようにする
        <div suppressHydrationWarning={true}>
          <div style={{ paddingBottom: "1rem" }}>{ currentUser } でログインしています。</div>
        </div>
      ):(
        <div suppressHydrationWarning={true}>ログインしていません。</div>
      )}
    </div>
  );
}

export default Header;

// components/DreamFortune.tsx
"use client";

import React, { useMemo } from "react";
import LoadingBox from "./LoadingBox"; // ローディング表示用コンポーネント

// テーマ（何についての夢か）
export type Theme = "love" | "work" | "relationship" | "self";

// 感情（ざっくり3分類）
export type Sentiment = "negative" | "neutral" | "positive";

// 夢の舞台
export type Scene = "home" | "outside";

// 時間軸（過去 / 未来）
export type TimeFrame = "past" | "future";

// 夢の中での自分の立ち位置
export type Role = "active" | "passive";

// generateFortune に渡すコンテキスト
export type FortuneContext = {
  theme: Theme;
  sentiment: Sentiment;
  scene: Scene;
  timeFrame: TimeFrame;
  role: Role;
  text: string;
};

// FortuneContext のすぐ下あたりに追加
export function analyzeDream(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const theme = detectTheme(trimmed);
  const sentiment = detectSentiment(trimmed);
  const scene = detectScene(trimmed);
  const timeFrame = detectTimeFrame(trimmed);
  const role = detectRole(trimmed);

  const fortune = generateFortune({
    theme,
    sentiment,
    scene,
    timeFrame,
    role,
    text: trimmed,
  });

  return {
    theme,
    sentiment,
    scene,
    timeFrame,
    role,
    fortune,
  };
}


type Props = {
  text: string | null;   // ユーザーが保存した夢の本文
  loading: boolean;      // 夢占いローディング中かどうか
};

export default function DreamFortune({ text, loading }: Props) {
  const trimmed = (text ?? "").trim();

  // 夢の内容があるときだけ占い結果を計算
  const result = useMemo(() => {
    if (!trimmed) return null;
    const r = analyzeDream(trimmed);
    if (!r) return null;

    // 画面で今使っているのは theme / sentiment / fortune だけなのでそこだけ返す
    return { theme: r.theme, sentiment: r.sentiment, fortune: r.fortune };
  }, [trimmed]);

  return (
    <section className="dreamFortune">
      <h3 className="savedTitle">夢占いの結果</h3>

      {!trimmed && !loading ? (
        <div className="dreamFortuneBox">
          <p className="dreamFortuneText">まだ夢が保存されていません．</p>
        </div>
      ) : (
        <LoadingBox
          loading={loading}
          loadingMessage="夢の内容を解析中です…"
          result={result?.fortune ?? null}
        />
      )}
    </section>
  );
}

/**
 * テーマ判定（恋愛・仕事/勉強・人間関係・自己）
 * ── 後で形態素解析やMLに差し替えてもOKなように分離
 */
function detectTheme(text: string): Theme {
  const has = (words: string[]) => words.some((w) => text.includes(w));

  const loveWords = ["好き", "彼氏", "彼女", "告白", "デート", "恋", "キス", "手をつなぐ"];
  const workWords = [
    "仕事",
    "アルバイト",
    "バイト",
    "テスト",
    "試験",
    "授業",
    "レポート",
    "勉強",
    "課題",
    "締切",
  ];
  const relationWords = [
    "友達",
    "友人",
    "先輩",
    "後輩",
    "家族",
    "兄",
    "弟",
    "妹",
    "父",
    "母",
    "同級生",
    "クラスメイト",
  ];
  const selfWords = ["自分", "将来", "一人", "ひとり", "鏡", "自分の顔", "成長", "変わった"];

  if (has(loveWords)) return "love";
  if (has(workWords)) return "work";
  if (has(relationWords)) return "relationship";
  if (has(selfWords)) return "self";

  // どれにも当てはまらないときは自己テーマ寄りに倒す
  return "self";
}

/**
 * 簡易感情判定（ネガ / ニュートラル / ポジ）
 */
function detectSentiment(text: string): Sentiment {
  const positiveWords = ["楽しい", "嬉しい", "わくわく", "安心", "幸せ", "面白い", "ほっとした"];
  const negativeWords = ["怖い", "不安", "焦る", "疲れ", "つらい", "嫌", "怒る", "怒られた", "落ちる"];

  const score = (words: string[]) =>
    words.reduce((sum, w) => (text.includes(w) ? sum + 1 : sum), 0);

  const pos = score(positiveWords);
  const neg = score(negativeWords);

  if (pos === 0 && neg === 0) return "neutral";
  if (neg > pos) return "negative";
  if (pos > neg) return "positive";
  return "neutral";
}

/**
 * シーン判定（home / outside）
 */
function detectScene(text: string): Scene {
  const has = (words: string[]) => words.some((w) => text.includes(w));

  const homeWords = ["家", "部屋", "自分の部屋", "リビング", "実家", "マンション"];
  const outsideWords = ["道", "道路", "駅", "公園", "空", "海", "山", "街中", "外"];

  if (has(homeWords)) return "home";
  if (has(outsideWords)) return "outside";

  // 明示されていなければ，とりあえずhome寄りに倒す
  return "home";
}

/**
 * 時間軸判定（過去 / 未来）
 */
function detectTimeFrame(text: string): TimeFrame {
  const has = (words: string[]) => words.some((w) => text.includes(w));

  const pastWords = [
    "昔",
    "過去",
    "子供のころ",
    "子どものころ",
    "小さい頃",
    "小さいころ",
    "前に",
    "以前",
    "あの頃",
    "元彼",
    "元カノ",
  ];
  const futureWords = [
    "将来",
    "これから",
    "来週",
    "来月",
    "来年",
    "卒業後",
    "就職してから",
    "いつか",
  ];

  if (has(pastWords)) return "past";
  if (has(futureWords)) return "future";

  // はっきりしないときは，変化を含むとみなしてfuture寄り
  return "future";
}

/**
 * 夢の中での自分の立ち位置（能動 / 受動）
 */
function detectRole(text: string): Role {
  const has = (words: string[]) => words.some((w) => text.includes(w));

  const activeWords = [
    "話しかけた",
    "告白した",
    "走った",
    "追いかけた",
    "助けた",
    "決めた",
    "選んだ",
    "飛び込んだ",
    "挑戦した",
  ];
  const passiveWords = [
    "追いかけられた",
    "怒られた",
    "襲われた",
    "巻き込まれた",
    "見ているだけだった",
    "何もできなかった",
    "立ち尽くしていた",
  ];

  const active = has(activeWords);
  const passive = has(passiveWords);

  if (active && !passive) return "active";
  if (!active && passive) return "passive";

  // 両方 or どちらも検知できないときは，とりあえず能動寄りに倒す
  return "active";
}

/**
 * 夢占い結果生成ロジック
 */
function generateFortune(ctx: FortuneContext): string {
  // ===== love × negative =====

  // love × negative × home × past × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "過去の恋愛で自分から動いた経験が，身近な環境とも結びついて残っており，「もっと違う方法があったかもしれない」という後悔が強く反映されている．";
  }

  // love × negative × home × past × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "家庭的な場面で受け身になった過去の恋愛の記憶が，心の底に残っており，「言いたいことを言えなかった」という感覚が繰り返されている可能性がある．";
  }

  // love × negative × home × future × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "将来，誰かとの関係を自分から築こうとする意識はある一方で，家という安心できる領域から外に踏み出すことに慎重になっている様子が見られる．";
  }

  // love × negative × home × future × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "今後の恋愛において安全な範囲にとどまりたい気持ちが強く，変化を自分から起こすよりも「来るものを待ちたい」というスタンスが反映されている．";
  }

  // love × negative × outside × past × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "人前で積極的になった過去の恋愛経験に対する羞恥や悔いが残っており，「注目されたくなかった」という本心が夢の中で再浮上していると考えられる．";
  }

  // love × negative × outside × past × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "外の場面でうまく動けなかった記憶が影響しており，「チャンスがあったのに何もできなかった」というもどかしさが再現されている．";
  }

  // love × negative × outside × future × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから自分で恋愛を切り開こうとする意志はあるものの，人との距離感や環境の変化に対する緊張が先立ち，「踏み出す勇気」を試されている段階だと読み取れる．";
  }

  // love × negative × outside × future × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "新しい恋愛の可能性は感じつつも，環境に流されがちで主導権を握れない不安があり，「期待よりもこわさが勝っている」状態が示されている．";
  }

  // ===== love × neutral =====

  // love × neutral × home × past × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "過去の恋愛において自分から行動した経験があるものの，強い感情ではなく「特に良くも悪くもなかった」という整理し切れない感覚が残っていることを示している．";
  }

  // love × neutral × home × past × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "身近な環境で静かに相手を見守る形となった恋愛経験が，強い後悔や喜びではなく「そのまま終わってしまった」という曖昧な印象として心に留まっている可能性がある．";
  }

  // love × neutral × home × future × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "将来の恋愛において自分から動こうとする意識はあるが，とくに期待や不安が強いわけではなく，「流れに応じて考えよう」という落ち着いた態度が反映されている．";
  }

  // love × neutral × home × future × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "今後の恋愛に対して特定の感情を抱えているわけではなく，「状況を見ながら判断したい」という無理のない姿勢が，安全な環境での静かな待機姿勢として表現されている．";
  }

  // love × neutral × outside × past × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "表に出て積極的に振る舞った過去の恋愛経験に対して，強い失敗や成功の印象は残っておらず，「あれはあれで良かった」という中立的な評価がなされつつあることを示唆している．";
  }

  // love × neutral × outside × past × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "自分から踏み込むことなく周囲の流れに任せた過去の恋愛が，特に痛みや喜びとして残っているわけではなく，「自然に過ぎた出来事」という記憶として扱われている可能性がある．";
  }

  // love × neutral × outside × future × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "外部の環境に身を置きながら，必要であれば自分から関係を動かす意思はあるが，強く期待するわけでもなく「その時が来れば動く」という柔軟な姿勢が示されている．";
  }

  // love × neutral × outside × future × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "今後の恋愛に対して特別な感情を抱くことなく，「無理に動くよりも自然な流れに任せたい」というスタンスが，外の環境に身を置きながらも静観する形で反映されている．";
  }

  // ===== love × positive =====

  // love × positive × home × past × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "過去の恋愛で，自分から動いた経験が心地よい記憶として残っており，「あのときの勇気は悪くなかった」と前向きに振り返れている状態がうかがえる．";
  }

  // love × positive × home × past × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "身近な場所で相手の気持ちを静かに受け取ったり，見守る形になった過去の恋愛が，穏やかな安心感として心に残っていると考えられる．";
  }

  // love × positive × home × future × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これからの恋愛を，自分のペースで育てていこうとする前向きな意志があり，「いつか誰かと落ち着いた時間を共有したい」というあたたかな期待がにじんでいる．";
  }

  // love × positive × home × future × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "将来の恋愛に対して，「無理に動かなくても，良いご縁があれば受け止めたい」という穏やかな受け身の姿勢が，安心感とともに表れている．";
  }

  // love × positive × outside × past × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "外の世界で自分から一歩踏み出した過去の恋愛経験が，「あのとき挑戦してよかった」という前向きな思い出として整理されつつあることを示している．";
  }

  // love × positive × outside × past × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "周囲の流れに身を任せながらも，結果的には悪くない形で終わった恋愛体験が，「あれは自然な形だった」と穏やかに受け止められている状態だと考えられる．";
  }

  // love × positive × outside × future × active
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから外の世界で新しい出会いや恋愛に，自分から積極的に関わっていこうとする前向きさが強く，環境の変化もポジティブに受け止められているサインである．";
  }

  // love × positive × outside × future × passive
  if (
    ctx.theme === "love" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "今後の恋愛に対して，「良い流れが来たらそのときに乗ればいい」というゆったりとした楽観性があり，自然な出会いを信じる感覚が夢に反映されている．";
  }

  // ===== work × negative =====

  // work × negative × home × past × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "過去に自宅など身近な場所で積極的に取り組んだ学業や仕事に関する経験が、今も「もっとやり方があったのでは」という悔しさとして記憶に残っている可能性がある．";
  }

  // work × negative × home × past × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "過去に自宅環境で十分に動けなかった勉強や課題への後悔が示され，「もっと主体的に行動できたはず」という気持ちが心の奥に残っていると考えられる．";
  }

  // work × negative × home × future × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから身近な場所で集中して作業しようという意志はあるが，環境の甘さによる不安や「自分に厳しくできるか」が懸念として映し出されている．";
  }

  // work × negative × home × future × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "今後の課題や仕事に対して，自ら動くより環境に流される傾向があり，「やらなきゃとは思うが腰が重い」という心理が表れている．";
  }

  // work × negative × outside × past × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "学校や職場など外部で積極的に動いたものの，「目立ちたくなかった」「失敗が気になった」という感情が過去の体験から再浮上していると読み取れる．";
  }

  // work × negative × outside × past × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "外の場面で自分の力を発揮できず，「もっと動けばよかった」というもどかしさが記憶として残っている可能性がある．";
  }

  // work × negative × outside × future × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから周囲と関わる場面で行動しようとする意欲はある一方で，「結果が出せるか不安」という気持ちが先行している状態だと考えられる．";
  }

  // work × negative × outside × future × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "未来の学業や仕事に向けて，「流れに任せたい」「勢いが出ない」という心理が映し出されており，主体性より慎重さが強く働いている．";
  }

  // ===== work × neutral =====

  // work × neutral × home × past × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "過去に自宅で主体的に取り組んだ学習や作業について，特に強い成功や後悔ではなく「無難だった」という客観的な整理が進んでいることが示唆される．";
  }

  // work × neutral × home × past × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "自宅で静かに取り組んだ学業が，良くも悪くもなく自然に過ぎたという印象で記憶されている可能性がある．";
  }

  // work × neutral × home × future × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "今後，必要であれば自宅で主体的に作業しようという姿勢はあるものの，熱量や不安は大きくなく，「状況に応じて進める」という柔らかい心理が反映されている．";
  }

  // work × neutral × home × future × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "将来の学業や課題に不足も焦りも感じておらず，「必要になればやる」といった自然体が，共に安心できる環境で表されている．";
  }

  // work × neutral × outside × past × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "過去に外部で積極的に取り組んだ課題は，特別な成功や失敗としてでなく，「経験のひとつ」として整理されていると考えられる．";
  }

  // work × neutral × outside × past × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "外の場で周囲に合わせた学習や作業が，自然な流れとして記憶されている可能性がある．";
  }

  // work × neutral × outside × future × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "今後の取り組みでは，必要であれば外部で行動する意思があり，「状況が整えば踏み出す」という柔軟性が示されている．";
  }

  // work × neutral × outside × future × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "未来の仕事・学業に対して，無理に行動せず流れに任せる姿勢が見られ，「必要があればそのときに動く」やや受け身の精神状態だと考えられる．";
  }

  // ===== work × positive =====

  // work × positive × home × past × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "過去に自宅で主体的に取り組んだ学習や作業が良い記憶として残っており，「やれば結果につながる」という自信に近い感覚が反映されている．";
  }

  // work × positive × home × past × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "身近な場所で落ち着いて取り組んだ作業が良い形で終わっており，「穏やかに進める方法もある」という安心感が記憶として残っている．";
  }

  // work × positive × home × future × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "今後も自宅などで自分のペースを活かしながら主体的に取り組めるという前向きな姿勢があり，「成果につながる準備が整っている」状態が示される．";
  }

  // work × positive × home × future × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "未来に向けて，「無理せずても進められる」という落ち着いた期待があり，安心できる範囲で自然に成果を出そうとする心境が映されている．";
  }

  // work × positive × outside × past × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "外部で主体的に挑戦した経験が「やって良かった」という形で記憶されており，自信や成長感として定着している．";
  }

  // work × positive × outside × past × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "外の場面で自然に流れに任せた結果が良かった経験があり，「あれはあれで正しかった」という穏やかな肯定感が表れている．";
  }

  // work × positive × outside × future × active
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "今後，外部での挑戦や取り組みに積極的な意思があり，「環境の変化も味方につけられる」と前向きに捉えていることが示される．";
  }

  // work × positive × outside × future × passive
  if (
    ctx.theme === "work" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "未来の仕事や学習に対して，「良い流れに乗れば自然に成果が出る」という楽観性が反映されており，信頼した構えが夢に表れている．";
  }

  // ===== relationship × negative =====

  // relationship × negative × home × past × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "家族や身近な人間関係に対して，自分から動いたのにうまくいかなかった記憶が残っており，「あのときの言い方は正しかったのか」という後悔やモヤモヤが反映されている．";
  }

  // relationship × negative × home × past × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "家庭内や身近な関係で何も言えずに飲み込んだ経験が，「本当は気持ちを伝えたかった」という未消化の感情として心に残っている可能性がある．";
  }

  // relationship × negative × home × future × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "今後，家族や近しい相手と向き合おうとはしているものの，「自分から切り出すのがこわい」という葛藤があり，関係調整への不安が夢ににじんでいる．";
  }

  // relationship × negative × home × future × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "これからの身近な人間関係において，自分から変化を起こすよりも，相手の出方を待とうとする傾向が強く，「波風を立てたくない」という慎重さが表れている．";
  }

  // relationship × negative × outside × past × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "学校やバイト先など，外の場で友人や知人と関わった過去の出来事について，「空回りしてしまった」「場の空気を読み違えた」という後悔が再現されていると考えられる．";
  }

  // relationship × negative × outside × past × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "周囲の輪に入れなかったり，ただ眺めているだけだった場面が影響しており，「話に入りたかった」「もっと関われたはず」という寂しさや悔しさが映っている．";
  }

  // relationship × negative × outside × future × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから新しい人間関係に踏み出そうとする意欲はあるが，「また失敗したらどうしよう」という不安が強く，挑戦と警戒心が同時に働いている状態だと読み取れる．";
  }

  // relationship × negative × outside × future × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "新しい環境や集団の中で，自分から関わるよりも様子見をしたい気持ちが強く，「拒絶されたくない」「浮きたくない」という防衛的な感覚が反映されている．";
  }

  // ===== relationship × neutral =====

  // relationship × neutral × home × past × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "家族や身近な人に対して自分から声をかけたり行動した経験が，良くも悪くもない「いつものやり取り」として整理されつつあり，感情的な重さは薄れている．";
  }

  // relationship × neutral × home × past × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "家庭内で受け身の立場に回っていた過去の場面が，「特に問題はなかったが主役でもなかった」というニュートラルな印象として残っている可能性がある．";
  }

  // relationship × neutral × home × future × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから身近な人間関係を少しずつ自分なりに整えていこうという意識はあるが，強い期待や不安はなく，「必要になったときに動く」という落ち着いた構えが表れている．";
  }

  // relationship × neutral × home × future × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "今後の家族関係や身近な付き合いについて，「大きな変化は求めていない」「今の距離感で良い」という，穏やかな現状維持の意識が反映されている．";
  }

  // relationship × neutral × outside × past × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "友人関係やコミュニティの中で自分から関わった経験が，「悪くもないし特別良くもなかった」という，中立的な思い出として整理されつつあることを示している．";
  }

  // relationship × neutral × outside × past × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "輪の外側から様子を見ていたような過去の場面が，「ああいうポジションもありだった」と，それなりに納得した形で受け止められている可能性がある．";
  }

  // relationship × neutral × outside × future × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これからの人付き合いにおいて，必要であれば自分から動こうという柔軟さがあり，「無理に盛り上げ役にならなくていい」という適度な距離感が反映されている．";
  }

  // relationship × neutral × outside × future × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "今後の友人関係や新しい集まりに対して，「流れに任せていれば必要なつながりはできる」という穏やかなスタンスで臨もうとしている状態がうかがえる．";
  }

  // ===== relationship × positive =====

  // relationship × positive × home × past × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "家族や身近な人に自分から関わった経験が，「あのとき話してよかった」「距離が縮まった」といった温かい記憶として残っており，関係への自信につながっている．";
  }

  // relationship × positive × home × past × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "相手の言葉や優しさを受け取る側に回った過去の場面が，「見守られていた」「支えられていた」という安心感として心に残っていると考えられる．";
  }

  // relationship × positive × home × future × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから身近な人たちと，もっと素直に話したり支え合ったりしたいという前向きな意志があり，「自分から関係を良くしていける」という感覚が反映されている．";
  }

  // relationship × positive × home × future × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "将来の家族関係や身近なつながりに対して，「自然に良い関係が続いていく」と信じる穏やかな楽観性があり，相手からの好意や支えを受け入れる準備ができている．";
  }

  // relationship × positive × outside × past × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "友人や周囲と積極的に関わった過去の経験が，「あのとき勇気を出して話しかけてよかった」という成功体験として残っており，人との距離を縮める力への自信になっている．";
  }

  // relationship × positive × outside × past × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "周りの人に誘われたり，優しくされる側だった出来事が，「受け入れてもらえた」という安心感として記憶されており，自分の存在価値への肯定感につながっている．";
  }

  // relationship × positive × outside × future × active
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから新しい友人関係やコミュニティに，自分から飛び込んでいこうとする明るい前向きさが強く，「人との出会いを楽しみたい」という気持ちが夢に表れている．";
  }

  // relationship × positive × outside × future × passive
  if (
    ctx.theme === "relationship" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "未来の人間関係に対して，「良い出会いがきっと訪れる」という楽観的な信頼があり，自然な形でつながりが生まれることを静かに期待している状態だと読み取れる．";
  }

  // ===== self × negative =====

  // self × negative × home × past × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "過去に自分を変えようと決意して行動したものの，思うようにいかなかった経験があり，「あのときの自分は未熟だった」という自己否定の感覚がまだ残っていることを示している．";
  }

  // self × negative × home × past × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "家の中で何も変えられずに時間だけが過ぎていったように感じており，「もっと動けたはずなのに」という無力感や後悔が心に影を落としている可能性がある．";
  }

  // self × negative × home × future × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから自分を変えたい思いはあるが，「本当にやり切れるのか」という不安が強く，安全な環境の中でも一歩を踏み出すことに慎重になっている状態が表れている．";
  }

  // self × negative × home × future × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "将来の自分像を思い描きつつも，「どうせ変われないかもしれない」という諦めに近い感覚があり，変化を外部要因に任せてしまいたい気持ちがにじんでいる．";
  }

  // self × negative × outside × past × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "外の世界で自分をアピールしたり，新しいことに挑戦した過去の経験が，「うまくいかなかった」「無理をしていた」と感じられ，黒歴史のように心に引っかかっていると考えられる．";
  }

  // self × negative × outside × past × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "周囲に合わせるだけで，自分の意見や個性を出せなかった過去の場面が，「あのとき本当はどうしたかったのか」という自己理解のモヤモヤとして残っている．";
  }

  // self × negative × outside × future × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから外の環境で自分を試そうとする意志はありつつ，「評価されなかったらどうしよう」という恐れが強く，自分らしさと不安がせめぎ合っている状態を映している．";
  }

  // self × negative × outside × future × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "negative" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "将来の自分について，周りの期待や空気に流されてしまうイメージがあり，「自分の人生を自分で選べていない」という感覚が心のどこかでくすぶっている可能性がある．";
  }

  // ===== self × neutral =====

  // self × neutral × home × past × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "過去に自分の習慣や考え方を変えようと試みた経験が，「特別な成功でも失敗でもない一つのステップ」として落ち着いて振り返られていることを示している．";
  }

  // self × neutral × home × past × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "家で受け身のまま過ごしてきた時間について，「あの頃の自分はああいう時期だった」と，良し悪しを決めずにそのまま受け入れつつある段階だと考えられる．";
  }

  // self × neutral × home × future × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから自分を少しずつ整えていこうという気持ちはあるが，劇的な変化を求めているわけではなく，「できる範囲でやってみよう」という現実的なスタンスが反映されている．";
  }

  // self × neutral × home × future × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "将来の自分に対して，強い期待や不安は抱かず，「環境や気分が整えば自然に変わっていくだろう」という，ゆるやかな自己受容の姿勢が示されている．";
  }

  // self × neutral × outside × past × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "外の場で自分なりに頑張った経験が，「成功か失敗か」で割り切るよりも，「一つの経験」としてフラットに整理されつつあることを表している．";
  }

  // self × neutral × outside × past × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "周囲に合わせて生きていた時期について，「あれはあれで必要な段階だった」と，どちらかに評価を振り切らずに眺められるようになってきている可能性がある．";
  }

  // self × neutral × outside × future × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから外の環境で自分を少しずつ試そうという意識はあるが，「全力でがんばる」というよりも，「無理のない範囲で挑戦してみる」というバランス感覚が反映されている．";
  }

  // self × neutral × outside × future × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "neutral" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "将来の自分像に対して，「社会や周りの流れの中で，そのときの自分なりに立っていればいい」という，やや受け身だが落ち着いた心構えが示されている．";
  }

  // ===== self × positive =====

  // self × positive × home × past × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "過去に自宅でコツコツ積み重ねた努力や習慣づくりが，「あのときの自分よく頑張っていた」と，温かい自己評価として残っており，現在の自己信頼の土台になっている．";
  }

  // self × positive × home × past × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "家の中で何もしていないように見えた時間も含めて，「あの頃の自分も悪くなかった」と，過去の自分を優しく許し始めている状態がうかがえる．";
  }

  // self × positive × home × future × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから自分のペースで成長していこうという前向きな意志があり，「自分なら少しずつ変わっていける」という静かな自信が，安心できる環境と結びついて表れている．";
  }

  // self × positive × home × future × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "home" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "将来の自分に対して，「完璧でなくても，今の自分の延長線上で十分やっていける」という受容的な感覚があり，自然体のまま成長していこうとする姿勢が示されている．";
  }

  // self × positive × outside × past × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "active"
  ) {
    return "外の世界で挑戦した経験が，「あのとき一歩踏み出した自分はえらかった」と，誇らしい記憶として残っており，新しい環境への耐性や自信につながっている．";
  }

  // self × positive × outside × past × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "past" &&
    ctx.role === "passive"
  ) {
    return "周囲に支えられたり導かれたりしながら過ごした時期を，「あの環境があったから今の自分がある」と感謝を込めて振り返れており，自分の歩みを肯定的に受け止めている．";
  }

  // self × positive × outside × future × active
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "active"
  ) {
    return "これから外の環境に飛び込み，自分らしさを試していこうとする強い前向きさがあり，「どんな場所でも自分なりにやっていける」という感覚が夢に投影されている．";
  }

  // self × positive × outside × future × passive
  if (
    ctx.theme === "self" &&
    ctx.sentiment === "positive" &&
    ctx.scene === "outside" &&
    ctx.timeFrame === "future" &&
    ctx.role === "passive"
  ) {
    return "将来の自分について，「環境や出会いに恵まれながら，自然な流れで成長していける」という楽観的な信頼があり，世界と自分との相性の良さをどこかで感じている状態だと読み取れる．";
  }


  // ここまでのどれにも当てはまらなかったときの保険
  return "この夢には，自分自身に対する感情や未来への姿勢がまだ明確な形になっていないまま映し出されている可能性がある．印象に残った場面や気持ちを静かに振り返ることで，今のあなたが何を求め，何に不安を感じているのかが少しずつ輪郭を帯びていくだろう．";


}

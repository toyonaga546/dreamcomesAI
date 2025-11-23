// components/DreamFortune.tsx
"use client";

import React, { useMemo } from "react";
import LoadingBox from "./LoadingBox"; // ローディング表示用コンポーネント

type Theme = "love" | "work" | "relationship" | "self";
type Sentiment = "negative" | "neutral" | "positive";

type Props = {
  text: string | null;   // ユーザーが保存した夢の本文
  loading: boolean;      // 夢占いローディング中かどうか
};

export default function DreamFortune({ text, loading }: Props) {
  const trimmed = (text ?? "").trim();

  // 夢の内容があるときだけ占い結果を計算
  const result = useMemo(() => {
    if (!trimmed) return null;

    const theme = detectTheme(trimmed);
    const sentiment = detectSentiment(trimmed);
    const fortune = generateFortune(theme, sentiment, trimmed);

    return { theme, sentiment, fortune };
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
  const loveWords = ["好き", "彼氏", "彼女", "告白", "デート", "恋"];
  const workWords = ["仕事", "バイト", "テスト", "試験", "授業", "レポート", "勉強"];
  const relationWords = ["友達", "先輩", "後輩", "家族", "兄", "弟", "妹", "父", "母"];

  const has = (words: string[]) => words.some((w) => text.includes(w));

  if (has(loveWords)) return "love";
  if (has(workWords)) return "work";
  if (has(relationWords)) return "relationship";
  return "self";
}

/**
 * 簡易感情判定
 * ── ここが「レベル1のMLゾーン」に差し替わる予定の場所
 * 今はポジ・ネガ単語の重みでそれっぽくスコアリング
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
 * テーマ × 感情 から占い文を生成
 * ── ここにテンプレを増やしていくと「占い師っぽさ」が上がる
 */
function generateFortune(theme: Theme, sentiment: Sentiment, _text: string): string {
  if (theme === "love" && sentiment === "negative") {
    return "この夢には，恋愛に対する不安や戸惑いが表れているように見える．相手の気持ちや今後の関係がはっきりせず，心のどこかでモヤモヤを抱えているのかもしれない．一度，自分が本当に望んでいる距離感や関係性を整理してみると，気持ちが少し軽くなるだろう．";
  }

  if (theme === "love" && sentiment === "positive") {
    return "恋愛面で前向きな変化が起きつつあるときによく見られる夢であると考えられる．相手との関係に期待や安心感があり，自分でも気づかないうちに自信が育ってきているのかもしれない．小さな一歩を踏み出すことで，良い流れがさらに加速していくだろう．";
  }

  if (theme === "work" && sentiment === "negative") {
    return "勉強や仕事，あるいは将来に関するプレッシャーが強くなっているときに現れやすい夢であると考えられる．「失敗したくない」「間に合うだろうか」といった不安が，夢の中で追いかけっこやトラブルとなって現れている可能性がある．完璧を目指しすぎず，今できる一歩だけに意識を向けてみると，心の負担が少し和らぐだろう．";
  }

  if (theme === "work" && sentiment === "positive") {
    return "勉強や仕事に対して前向きに取り組めている状態が，夢に反映されていると考えられる．新しい挑戦や環境の変化に対して，不安よりも「やってみたい」という気持ちが勝っているのかもしれない．この流れを活かすためにも，小さな達成体験を積み重ねる意識を持つとよいだろう．";
  }

  if (theme === "relationship" && sentiment === "negative") {
    return "人間関係の中で，言えなかった本音や気まずさが残っているときに見やすい夢であると考えられる．夢の中の相手は，実際の特定の人物というよりも，「こう見られているかもしれない」というあなたの不安の象徴である場合も多い．無理に明るく振る舞うより，信頼できる相手に少しだけ本音を打ち明けてみると，心が軽くなるだろう．";
  }

  if (theme === "relationship" && sentiment === "positive") {
    return "周囲とのつながりや安心感が，良い形で心に残っているときに現れやすい夢であると考えられる．最近あった楽しい出来事や，何気ない会話が，夢の中で心地よいシーンとして再生されているのかもしれない．その感覚を大切にしながら，感謝の気持ちを言葉にして伝えてみると，さらに人間関係が安定していくだろう．";
  }

  if (theme === "self" && sentiment === "negative") {
    return "自分自身に対する不安や，まだ受け入れきれていない一面が，夢の形となって現れている可能性がある．「このままで大丈夫だろうか」という感覚が強まると，夢の中で迷子になったり，トラブルに巻き込まれる場面として表れることが多い．欠点を直そうとする前に，まずは今の自分ができていることに目を向けてみると，少しずつ自己肯定感が戻ってくるだろう．";
  }

  if (theme === "self" && sentiment === "positive") {
    return "自分の変化や成長を，心のどこかでちゃんと感じ取れているときに現れやすい夢であると考えられる．新しい挑戦や決断に向けて，気持ちの準備が整いつつあるサインともいえる．思いついたアイデアややってみたいことをメモに残し，小さく試していくことで，夢で見た前向きな流れが現実にもつながっていくだろう．";
  }

  // デフォルトのメッセージ
  return "この夢には，あなたの心の中で進行している変化や気づきが映し出されているように見える．印象に残った場面や登場人物を思い出し，「自分のどんな気持ちが形になったものか」をゆっくり振り返ってみると，新しい発見が得られるだろう．";
}

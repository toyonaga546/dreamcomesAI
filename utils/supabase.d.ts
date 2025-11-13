import type { SupabaseClient } from '@supabase/supabase-js';

// このファイル自体をモジュールとしてエクスポートします。
// utils/supabase.js をインポートする TypeScript ファイル向けの簡易型定義です。

// getSupabase は環境変数が整っていれば SupabaseClient を返します。
export function getSupabase(): SupabaseClient | null;

// supabase はクライアントまたは簡易フォールバックオブジェクトをエクスポートします。
// ここでは互換性のため any を許容します。
export const supabase: SupabaseClient | any;

export {};

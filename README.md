# AI Tour ダンジョン

TypeScript + HTML5 Canvas で動くターン制ローグライク風ダンジョン探索ゲームです。

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

## テスト

```bash
npm run test
```

## 操作

- 矢印キー / WASD: 移動
- `I`: インベントリ
- `1`-`9`: インベントリアイテム使用
- `.` または `Space`: 待機
- `>`: 階段を降りる
- `Enter`: 開始 / 再挑戦

## 実装済み機能

- BSPベースのダンジョン自動生成
- ターン制移動と戦闘
- 敵AI追跡
- 視界制限と探索済みマップ
- アイテム拾得と装備
- ローカルハイスコア保存
# シャーシャー猫 🐈

通話相手の怒鳴り声を、猫の威嚇に変換するアプリです。
音声は録音・送信されず、ブラウザ内で音量レベルの解析のみを行います。

## フォルダ構成

```
shaa-neko/
├── site/          … Web版（GitHub Pagesなどでそのまま公開できます）
│   └── index.html
└── extension/     … Chrome拡張版（サイドパネル + タブ音声キャプチャ）
    ├── manifest.json
    ├── background.js
    ├── sidepanel.html
    ├── sidepanel.js
    └── icons/
```

## Web版の公開手順（GitHub Pages・無料）

1. GitHubで新しいリポジトリを作成（例: `shaa-neko`）
2. `site/index.html` をリポジトリ直下にアップロード
3. リポジトリの Settings → Pages → Branch を `main` にして保存
4. 数分後、`https://あなたのユーザー名.github.io/shaa-neko/` で公開されます

## Chrome拡張版の動作確認（自分のPCで試す）

1. Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」→ `extension` フォルダを選択
4. ツールバーの猫アイコンをクリック → サイドパネルが開きます
5. 通話ソフト（ブラウザ電話・Zoom Web版など）のタブを開いた状態で
   「🎧 このタブの音声をひろう」を押すと、そのタブの音声で猫が反応します
   （取得中も相手の声はそのまま聞こえます）

## Chromeウェブストアでの公開手順

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) に登録
   （初回のみ登録料 $5）
2. `extension` フォルダをZIP圧縮してアップロード
3. ストア掲載情報を入力：
   - スクリーンショット（1280×800推奨）を1枚以上
   - 説明文
   - **プライバシーポリシー**：「音声を録音・保存・送信しない。
     タブ音声はブラウザ内で音量レベルの解析のみに使用する」旨を明記
     （GitHub Pagesに置いたページのURLでOK）
4. 権限の利用目的を申告：
   - `tabCapture` … 通話タブの音量を解析して猫を反応させるため
   - `activeTab` … 現在のタブを対象にするため
   - `storage` … 威嚇回数カウンターの保存のため
   - `sidePanel` … 猫を常駐表示するため
5. 審査に提出（通常数日〜1週間程度）

## 注意事項

- タブ音声キャプチャはPCのChrome / Edge向けの機能です
- `chrome://` ページやウェブストアのページの音声は取得できません
- 職場で使う場合は、画面上のツール利用ルールを一応ご確認ください

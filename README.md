# 3D Parallax Head Tracking Viewer

Webカメラで顔の位置を検出し、視点に応じて3Dシーンのカメラを動かすことで、平面のディスプレイが「窓」のように見える錯覚を生み出すWebアプリです。

![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)

## 🎮 デモ

**[▶ ライブデモを見る](https://kai-sijimi.github.io/head-tracking-parallax/)**

## ✨ 特徴

- **ヘッドトラッキング** - Webカメラで顔の位置をリアルタイム検出
- **パララックス効果** - 頭の動きに応じて3Dシーンの視点が変化
- **3つのモデル** - キューブ、キャラクター、部屋から選択可能
- **フルスクリーンモード** - 没入感のある体験が可能
- **レスポンシブ** - 画面サイズに自動調整

## 🛠️ 使用技術

- **[Three.js](https://threejs.org/)** - 3Dレンダリング
- **[MediaPipe Face Detection](https://google.github.io/mediapipe/)** - 顔検出
- **HTML5 / CSS3 / JavaScript** - フロントエンド

## 📖 使い方

1. ページを開く
2. 「カメラを起動」ボタンをクリック
3. カメラへのアクセスを許可
4. 頭を左右・上下に動かしてパララックス効果を体験！
5. 「フルスクリーン」ボタンで没入モードに切り替え

## 🎨 3Dモデル

| モデル | 説明 |
|--------|------|
| **キューブ** | カラフルな回転キューブと浮遊するミニキューブ |
| **キャラクター** | かわいいマスコットキャラクター |
| **部屋** | デスク、モニター、ランプなどがある室内シーン |

## 💡 仕組み

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   [Webカメラ] → [顔検出] → [頭の位置を計算]     │
│                              ↓                  │
│   [3Dシーン] ← [カメラ位置を調整] ← [視点変換]  │
│                                                 │
└─────────────────────────────────────────────────┘
```

頭を動かすと、それに合わせて3Dシーンの「見る角度」が変わります：
- **左に動く** → 3Dオブジェクトの右側が見える
- **上に動く** → 3Dオブジェクトの下側が見える

まるでディスプレイの向こう側に実際に物体があるかのような錯覚が生まれます！

## 🚀 ローカルで実行

```bash
# リポジトリをクローン
git clone https://github.com/Kai-sijimi/head-tracking-parallax.git

# ディレクトリに移動
cd head-tracking-parallax

# ローカルサーバーを起動（Python）
python -m http.server 8080

# または Node.js
npx serve
```

ブラウザで `http://localhost:8080` を開く

## 📝 ライセンス

MIT License

## 🙏 参考

- [Johnny Lee's Wii Remote Head Tracking](https://www.youtube.com/watch?v=Jd3-eiid-Uw)
- [Three.js Documentation](https://threejs.org/docs/)
- [MediaPipe Face Detection](https://google.github.io/mediapipe/solutions/face_detection.html)


# 使用ライブラリと参考

- Three.js: MIT。既存の描画基盤を利用。node_modules/three/LICENSE。
- GSAP: Standard No Charge License。MIT等のOSSとは異なる独自ライセンス。通常のポートフォリオ用途で利用可能。https://gsap.com/community/standard-license/ 。インストール版のライセンスは app/node_modules/gsap/LICENSE に付属。
- 採用: GSAPのTween・delayedCallをホバー、波の時間、ポインター追従、遷移の制御に利用。
- 参考: https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/
- Flowmap作例は着想の参考のみ。今回の局所変形は独自実装の速度追従であり、流体シミュレーションではない。OGLなどの別レンダラーは重複するため追加していない。
- スクロール・ドラッグ係数と慣性の式は従来どおり。動きを減らす設定と小画面は既存の静的表示を使用。

## 検証
本番ビルド成功。実ブラウザーで描画・ホバー・クリック・作品詳細への遷移を確認。新バンドル由来のエラーログ0件。GSAPとThree.jsの配布ライセンスをlicenses/へ保存。

<div align="center">
  <div style="display: flex">
    <img src="./docs/device_mockup.png" alt="App screen" width="40%"/>
    <h1>BecauseOfProg's mobile app</h1>
  </div>
  <h3>The fastest way to read articles from the team</h3>
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/BecauseOfProg/app"/>
  </a>
</div>
<br>

- [📥 Get the app](#-get-the-app)
- [🌈 How it works](#-how-it-works)
- [💻 Development](#-development)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
- [🇫🇷 Translate the app](#-translate-the-app)
- [📜 Credits](#-credits)
- [🔐 License](#-license)

## 📥 Get the app

The app is being automatically compiled with Github Actions, thanks to [this project](https://github.com/realabbas/Github-Actions-React-Native).

Then, the files are being send in SSH to the BecauseOfProg VPS, thanks to [this action](https://github.com/appleboy/scp-action), and available here : [becauseofprog.fr/page/app](https://becauseofprog.fr/page/app).

## 🌈 How it works

This React Native app use the **[BecauseOfProg API](https://github.com/BecauseOfProg/api)** to fetch articles and some content

- [React Native Paper](https://reactnativepaper.com/) is used to build some components (GUI)

- [React Native Markdown Display](https://github.com/iamacup/react-native-markdown-display) is used to display markdown articles

- [React Navigation](https://reactnavigation.org/) is used to switch between screens

## 💻 Development

### Prerequisites

- **react-native 0.63.x**
- Android Studio (or Android SDK)

### Setup

##### Fast refresh mode (development mode)

```bash
npx npm run android
npx npm run start
``` 

or

```bash
yarn run android
yarn run start
```

##### Build bundle

- Cli

`react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res"`

- Android Studio

    - Build (top menu)
    - Generate (Signed) Bundle/APK 
    - Choose Android App Bundle

##### Build apk

- Cli

`cd android && ./gradlew clean && ./gradlew assembleRelease`

- Android Studio

    - Build (top menu)
    - Generate (Signed) Bundle/APK 
    - Choose APK

## 🇫🇷 Translate the app

You can add your own language, by editing `./src/components/utils/locales/` (\<lang\>.js) and `./src/components/utils/i18n.js`.  
Then, make a pull request <3

## 📜 Credits

- Maintainer: [Noéwen (kernoeb)](https://github.com/kernoeb)
- Special thanks to :
  - [Gildas GH](https://github.com/Gildas-GH) (BecauseOfProg)
  - [Théo (exybore)](https://github.com/exybore) (BecauseOfProg)
  - [Nicolas (Whaxion)](https://github.com/whaxion) (BecauseOfProg)

## 🔐 License

GNU GPL v3. See [license file](./LICENSE)
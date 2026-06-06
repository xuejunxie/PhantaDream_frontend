# PhantaDream

**AI-powered art creation and NFT social platform — React Native mobile app.**

PhantaDream is the companion mobile application to the [PhantaSpace](https://phanta.space) metaverse. It lets users generate AI artwork, discover and follow artists, collect and trade NFTs, and earn Phanton tokens — all from iOS and Android.

---

## Features

### 🎨 AI Dream Studio
Generate images with a stable diffusion backend. Prompt, tweak, and publish artwork directly from your phone.

### 🌍 Explore
- Discover trending AI artworks and artist profiles
- Follow artists and build a personalised feed (For You, Following, Hot)
- Like, comment, and share artwork

### 🖼️ NFT Marketplace
Buy and sell AI-generated NFTs. Integrated with on-chain wallet via ethers.js.

### 💬 Notifications & Chat
Real-time notifications and in-app messaging powered by Firebase Realtime Database.

### 🪙 Phanton Token & In-App Purchases
- Earn and spend Phanton utility tokens
- Top up with in-app purchases (Apple IAP / Google Play Billing)

### 👤 Profile & Account
- Apple Sign-In and email authentication
- Manage published artwork and liked posts
- Billing and subscription management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.71, TypeScript |
| Navigation | React Navigation (Stack + Material Bottom Tabs) |
| State management | Redux + redux-thunk |
| Backend / Auth | Firebase (Auth, Firestore, Realtime DB, Storage, Messaging) |
| AI image generation | Custom Stable Diffusion API (`serverURL` in `globalValues.js`) |
| Web3 | ethers.js |
| In-app purchases | react-native-iap |
| Apple Sign-In | `@invertase/react-native-apple-authentication` |
| UI components | React Native Elements (`@rneui`), Neomorph Shadows, FontAwesome |
| Image handling | Camera Roll, Image Picker, Image Marker, cached images |
| iOS dependencies | CocoaPods |

---

## Getting Started

### Prerequisites

- Node.js ≥ 16
- Xcode (for iOS builds)
- Android Studio (for Android builds)
- A Firebase project with iOS app configured
- CocoaPods (`sudo gem install cocoapods`)

### Install

```bash
git clone https://github.com/phantaspace/PhantaDream_frontend.git
cd PhantaDream_frontend
npm install
```

### iOS setup

1. Download your `GoogleService-Info.plist` from the [Firebase Console](https://console.firebase.google.com) and place it at `ios/GoogleService-Info.plist`.
2. Install pods:

```bash
cd ios && pod install && cd ..
```

3. Run on simulator:

```bash
npx react-native run-ios
```

### Android setup

1. Download your `google-services.json` from the Firebase Console and place it at `android/app/google-services.json`.
2. Run on emulator:

```bash
npx react-native run-android
```

### Environment

The app reads a few values from `src/Components/common/globalValues.js`:

| Variable | Description |
|---|---|
| `serverURL` | Stable Diffusion API endpoint |
| `avatarRootURL` | Firebase Storage avatar root URL |
| `defaultAvatar` | Fallback avatar image URL |
| `productID` | In-app purchase product IDs |

Update these values for your own deployment.

> **Note:** `GoogleService-Info.plist` and `google-services.json` contain Firebase credentials. They are **not committed** to this repo. Obtain them from your Firebase project settings.

---

## Project Structure

```
PhantaDream_frontend/
├── src/
│   ├── App.tsx                     # Root component + navigation stack
│   ├── AppWithProviders.tsx        # Redux + Firebase providers wrapper
│   ├── Providers.tsx               # Context providers
│   ├── Components/
│   │   ├── Auth/                   # Sign-in (Apple, email)
│   │   ├── Dream/                  # AI image generation studio
│   │   │   ├── IAP/                # In-app purchase flows
│   │   │   ├── components/         # Dream UI components
│   │   │   └── utils/              # Generation helpers
│   │   ├── Explore/                # Browse artworks and artist pages
│   │   ├── Market/                 # NFT marketplace
│   │   ├── Me/                     # Profile, account, billing
│   │   ├── Notification/           # Real-time chat and notifications
│   │   └── common/                 # Shared values, hooks, utilities
│   └── redux/
│       └── reducers/               # Redux state slices
├── ios/                            # iOS native project (Xcode)
├── android/                        # Android native project (Gradle)
├── patches/                        # patch-package fixes for RN dependencies
├── App.js                          # Entry point
└── package.json
```

---

## Firebase Setup

This app uses the following Firebase services:

- **Authentication** — Apple Sign-In, email/password
- **Firestore** — user profiles, artwork metadata, likes
- **Realtime Database** — notifications, chat messages
- **Storage** — user-uploaded and AI-generated images
- **Cloud Messaging** — push notifications

You will need a Firebase project with these services enabled. Place the config files (`GoogleService-Info.plist` for iOS, `google-services.json` for Android) in the correct locations before building.

---

## Contributing

Pull requests are welcome. Please:

1. Fork the repo and create a feature branch from `main`.
2. Run the linter: `npx eslint src/`
3. Open a pull request with a clear description.

---

## License

MIT License

---

## Links

- **PhantaSpace web app:** [https://phanta.space](https://phanta.space)
- **Smart contracts:** [PhantaSpace_contract](https://github.com/xuejunxie/PhantaSpace_contract)
- **Web3 frontend:** [PhantaSpace_Web3](https://github.com/xuejunxie/PhantaSpace_Web3)

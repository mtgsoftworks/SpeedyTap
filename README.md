# SpeedyTap v0.1.0 - Mobile Game

🎮 **Fast-paced mobile tapping game built with modern TypeScript architecture**

[![Google Play Store](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=com.mtgsoftworks.speedytap&hl=en)

## About

SpeedyTap is an engaging fast-reaction mobile game that challenges players' reflexes and coordination. Built with cutting-edge web technologies and cross-platform compatibility in mind, this game delivers a smooth, responsive gaming experience across multiple devices.

The game features a progressive difficulty system where players must tap targets as quickly as possible to advance through increasingly challenging levels. With integrated AdMob monetization and modern mobile development practices, SpeedyTap represents a complete commercial mobile game solution.

**🎯 Available on Google Play Store**: [Download SpeedyTap](https://play.google.com/store/apps/details?id=com.mtgsoftworks.speedytap&hl=en)

## Project Features

### ⚡ Game Mechanics
- Fast-reaction tapping gameplay
- Level system with progression
- High score tracking
- Sound effects and haptic feedback
- Pause/resume functionality

### 📱 Modern Mobile Development
- **Capacitor 7**: Cross-platform mobile development framework
- **TypeScript**: Type safety and modern JavaScript features
- **Webpack 5**: Advanced bundling and optimization
- **AdMob Integration**: Banner and interstitial advertisements

### 🎯 AdMob Advertising Strategy
- **Banner Ads**: Persistent display on main menu
- **Interstitial Ads**:
  - Automatic display on game over
  - Shown every 3 levels
  - Optimized timing for enhanced user experience

## 🏗️ Architecture

This project follows modern software architecture principles:

### Sacred Folder Structure

```
src/
├── api/             # API clients and services
├── assets/          # Images, fonts, animations  
├── components/      # Reusable UI components
├── config/          # Environment configuration
├── constants/       # Application-wide constants
├── hooks/           # Custom React hooks
├── navigation/      # Navigation logic and routing
├── screens/         # Screen components
├── store/           # Redux Toolkit state management
├── theme/           # Styling and theming
├── types/           # TypeScript type definitions
└── utils/           # Helper functions and utilities
```

## 📦 Package Information
- **Package ID**: `com.mtgsoftworks.speedytap`
- **Version**: 0.1.0
- **Target SDK**: Android 34
- **Minimum SDK**: Android 22

## 🚀 Development

### Installation
```bash
npm install
npx cap sync
```

### Development Commands
```bash
npm run dev              # Start web development server
npm run android:dev      # Launch Android emulator
```

### Production Build
```bash
npm run build                        # Create web build
./android/gradlew assembleRelease    # Generate Android APK
```

## 🎯 AdMob Configuration

### Ad Unit IDs
- **Interstitial**: your_admob_unit_IDs`
- **Banner**: your_admob_unit_IDs``

### Advertisement Display Strategy
1. **Main Menu**: Banner ad placement (bottom section)
2. **Game Over**: Interstitial ad display
3. **Level Progression**: Interstitial every 3 levels
4. **During Gameplay**: Banner ads hidden for optimal UX

## 📱 APK Information
- **File**: `SpeedyTap-v0.1.0-MTGSoftworks-AdMob.apk`
- **Signed**: Yes (android.keystore)
- **AdMob**: Fully integrated
- **Size**: ~4 MB

## 🔧 Technical Details

### Key Dependencies
- **@capacitor/core**: 7.4.0
- **@capacitor-community/admob**: 7.0.3
- **TypeScript**: 5.6.3
- **Webpack**: 5.99.9

### Supported Platforms
- ✅ Android (API 22+)
- ✅ Web/PWA
- 🔄 iOS (in development)

## 👨‍💻 Developer
**Mesut Taha Güven** - MTG Softworks

*SpeedyTap v0.1.0 - Fast mobile gaming experience with integrated AdMob monetization*

---

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Sync Capacitor with `npx cap sync`
4. Run development server with `npm run dev`
5. For mobile testing, use `npm run android:dev`

## Contributing

This project follows modern development practices including:
- TypeScript for type safety
- Component-based architecture
- State management with Redux Toolkit
- Responsive design principles
- Performance optimization

For questions or contributions, please contact MTG Softworks.

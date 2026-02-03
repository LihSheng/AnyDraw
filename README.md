# 🎲 AnyDraw - Lucky Draw Collection

A modern, beautiful collection of lucky draw tools built with **Vue 3 + Vite + Tailwind CSS**.

![AnyDraw Screenshot](https://img.shields.io/badge/Vue-3-brightgreen) ![Vite](https://img.shields.io/badge/Vite-5-646CFF) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8)

## ✨ Features

### 🎡 Wheel Spin
- Canvas-animated spinning wheel
- Physics-based easing animation
- Dynamic segments based on participants
- Cryptographically secure random selection

### 🔢 Random Number
- Digit flip animation
- Customizable min/max range
- Secure random generation

### 🃏 Card Picker
- Card shuffle animation
- Click to reveal winner
- Visual deck effect

### 🛠️ Additional Features
- 📋 **Participant Management** - Add, remove, bulk import
- 🏆 **Winner History** - Timestamped records with game type
- 🔊 **Sound Effects** - Toggle audio feedback
- 🎉 **Party Effects** - Confetti celebration on win
- ☀️🌙 **Light/Dark Theme** - Switchable with persistence
- 💾 **LocalStorage** - All data persists across sessions

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build
```

## 🔐 Cryptographically Secure Randomness

All games use the Web Crypto API (`crypto.getRandomValues()`) for provably fair, unpredictable random selection.

## 📁 Project Structure

```
src/
├── components/
│   ├── games/
│   │   ├── WheelSpin.vue
│   │   ├── RandomNumber.vue
│   │   └── CardPicker.vue
│   ├── layout/
│   │   ├── Navbar.vue
│   │   └── SettingsModal.vue
│   ├── ParticipantList.vue
│   └── WinnerHistory.vue
├── composables/
│   ├── useStorage.js
│   ├── useSoundEffects.js
│   ├── useConfetti.js
│   └── useSecureRandom.js
├── App.vue
├── main.js
└── style.css
```

## 🎨 Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **Vite** - Lightning-fast dev server
- **Tailwind CSS 4** - Utility-first styling
- **Bun** - Fast JavaScript runtime & package manager

## 📄 License

MIT License - Feel free to use for your events!

---

Made with ❤️ for lucky draws everywhere

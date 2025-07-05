# Artify – Create, Launch, and Trade Creator Coins on Zora

[Live Site](https://artify-eight-bice.vercel.app/)

Artify is a next-generation platform empowering creators to easily launch their own coins on the Zora ecosystem, tokenize their work, and build vibrant communities. With seamless wallet integration, a modern UI, and deep Zora protocol support, Artify makes it effortless to create, share, and earn from your digital creations.

---

## 🚀 Features

- **One-Click Coin Creation:**  
  Launch your own creator coin on Zora with a simple, guided flow.

- **Marketplace Integration:**  
  List, buy, and sell tokens directly within the app.

- **Farcaster MiniApp Support:**  
  Artify is fully integrated as a [Farcaster MiniApp](https://farcaster.xyz/miniapps/AUXQuZoKwDPy/artify), enabling walletless onboarding and native social sharing.

- **Wallet Connect:**  
  Seamless EVM wallet connection via Farcaster or standard web wallets.

- **Modern, Responsive UI:**  
  Built with React, Tailwind CSS, and shadcn-ui for a beautiful experience on any device.

---

## 🛠️ How to Run Locally

1. **Clone the repository:**
   ```sh
   git clone https://github.com/aliveevie/artify-create-share-earn.git
   cd artify-create-share-earn
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server (with Vercel for API/Zora integration):**
   ```sh
   vercel dev
   ```

   > **Note:** The app uses Vercel serverless functions for API and Zora SDK operations. Make sure you have the [Vercel CLI](https://vercel.com/docs/cli) installed.

---

## 🧩 Technical Highlights

- **Zora SDK Integration:**  
  Full support for token creation, storage, and marketplace trading using the Zora protocol.  
  See implementation details: [Zora SDK PR #1](https://github.com/aliveevie/artify-create-share-earn/pull/1)

- **Farcaster MiniApp & Wallet:**  
  Native integration with Farcaster's MiniApp SDK and wallet connector for frictionless onboarding and EVM wallet actions.  
  See implementation details: [Farcaster MiniApp PR #2](https://github.com/aliveevie/artify-create-share-earn/pull/2)

- **Manifest & Meta Tags:**  
  Includes all required meta tags and manifest files for Farcaster MiniApp discovery and compliance.

- **Mobile-First Navigation:**  
  Responsive header with hamburger menu for optimal mobile usability.

---

## 📚 Resources

- [Live App on Vercel](https://artify-eight-bice.vercel.app/)
- [Farcaster MiniApp](https://farcaster.xyz/miniapps/AUXQuZoKwDPy/artify)
- [Zora Protocol](https://zora.co/)
- [Vercel CLI Docs](https://vercel.com/docs/cli)

---

## 🤝 Contributing

Pull requests and issues are welcome! Please see the linked PRs above for architectural context and implementation details.

---

## License

MIT

---

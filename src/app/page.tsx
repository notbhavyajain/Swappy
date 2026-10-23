import { SwapCard } from '@/components/SwapCard'
import { WalletButton } from '@/components/WalletButton'

export default function Home() {
  return (
    <main className="page">
      <header className="topbar">
        <span className="logo">swappy</span>
        <WalletButton />
      </header>

      <section className="hero">
        <h1>Move tokens across Ethereum &amp; L2s.</h1>
        <p>Pick what you have, pick what you want. Swappy asks LI.FI for the best route across bridges and DEXs.</p>
      </section>

      <SwapCard />

      <footer className="footer">
        Routes by <a href="https://li.fi" target="_blank" rel="noreferrer">LI.FI</a> · built by{' '}
        <a href="https://x.com/bhavyajain56044" target="_blank" rel="noreferrer">Bhavya Jain</a>
      </footer>
    </main>
  )
}

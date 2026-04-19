import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-name">✨ Surprizo</div>
          <p>The ultimate mystery box experience. Every box guarantees value above what you pay. Discover surprises across Tech, Beauty, Gaming, Snacks & more.</p>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link href="/boxes?category=TECH">Tech Boxes</Link></li>
            <li><Link href="/boxes?category=BEAUTY">Beauty Boxes</Link></li>
            <li><Link href="/boxes?category=GAMING">Gaming Boxes</Link></li>
            <li><Link href="/boxes?category=SNACKS">Snacks Boxes</Link></li>
            <li><Link href="/boxes?category=RANDOM">Random Boxes</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><Link href="/auth/login">Sign In</Link></li>
            <li><Link href="/auth/register">Register</Link></li>
            <li><Link href="/orders">My Orders</Link></li>
            <li><Link href="/profile">Profile</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><Link href="/#how-it-works">How It Works</Link></li>
            <li><a href="mailto:support@surprizo.com">Contact Us</a></li>
            <li><Link href="/">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Surprizo. All rights reserved. | Guaranteed value on every box 💎
      </div>
    </footer>
  );
}

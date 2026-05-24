import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-charcoal border-t border-white/5 pt-20 pb-10 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="font-bubbly text-3xl font-bold text-lime mb-6 block">
            THRIFTR
          </Link>
          <p className="font-editorial italic text-xl text-muted-gray max-w-md leading-relaxed">
            Nairobi&apos;s premium virtual thrift mall. Supporting independent thrift boutiques since 2026.
          </p>
        </div>
        
        <div>
          <h4 className="font-display font-bold text-xs tracking-widest text-white/40 mb-6 uppercase">Navigate</h4>
          <ul className="flex flex-col gap-4 font-display font-medium text-sm">
            <li><Link href="/mall" className="hover:text-lime transition-colors">The Mall</Link></li>
            <li><Link href="/stores" className="hover:text-lime transition-colors">Boutiques</Link></li>
            <li><Link href="/enroll" className="hover:text-lime transition-colors">Sell on THRIFTR</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-xs tracking-widest text-white/40 mb-6 uppercase">Support</h4>
          <ul className="flex flex-col gap-4 font-display font-medium text-sm">
            <li><Link href="#" className="hover:text-lime transition-colors">Shipping & Returns</Link></li>
            <li><Link href="#" className="hover:text-lime transition-colors">Escrow Protection</Link></li>
            <li><Link href="#" className="hover:text-lime transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="font-display text-xs text-white/30">
          © 2026 THRIFTR LIMITED. NAIROBI, KENYA.
        </p>
        <div className="flex gap-8 font-display text-xs font-bold">
          <Link href="#" className="hover:text-lime">INSTAGRAM</Link>
          <Link href="#" className="hover:text-lime">TIKTOK</Link>
          <Link href="#" className="hover:text-lime">WHATSAPP</Link>
        </div>
      </div>
    </footer>
  )
}

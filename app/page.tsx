import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import Ticker from '@/components/ui/Ticker'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-20">
          <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-soft-black" />
            <div className="grid grid-cols-2 md:grid-cols-4 h-full">
              {[1,2,3,4].map(i => (
                <div key={i} className="relative h-full overflow-hidden border-x border-white/5">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-30" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-4xl">
            <h2 className="font-editorial italic text-2xl md:text-3xl text-lime mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Badilisha. Nunua. Starehe.
            </h2>
            <h1 className="font-fashion text-5xl md:text-8xl font-bold tracking-tighter leading-none mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              THE VIRTUAL <br /> THRIFT MALL
            </h1>
            <p className="font-display text-lg md:text-xl text-muted-gray max-w-xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              Verified thrift boutiques, premium vintage finds, and secure M-Pesa escrow. 
              Nairobi&apos;s fashion underground, curated.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
              <Link href="/mall" className="bg-lime text-black font-display font-black text-sm px-10 py-5 rounded-full hover:scale-105 transition-transform flex items-center gap-2">
                ENTER THE MALL <ArrowRight size={18} />
              </Link>
              <Link href="/enroll" className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-display font-black text-sm px-10 py-5 rounded-full hover:bg-white/20 transition-all">
                SELL ON THRIFTR
              </Link>
            </div>
          </div>
        </section>

        <Ticker />

        {/* Featured Boutiques */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h4 className="font-display font-bold text-xs tracking-widest text-lime mb-4 uppercase">Directory</h4>
              <h2 className="font-fashion text-4xl md:text-5xl font-bold tracking-tight">FEATURED BOUTIQUES</h2>
            </div>
            <Link href="/stores" className="hidden sm:flex items-center gap-2 font-display font-bold text-sm hover:text-lime transition-colors">
              VIEW ALL <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: 'Think Twice Select', slug: 'think-twice', location: 'Nairobi CBD', img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop' },
              { name: 'Toi Vintage Vault', slug: 'toi-vault', location: 'Toi Market', img: 'https://images.unsplash.com/photo-1544441893-675973e306a5?q=80&w=2070&auto=format&fit=crop' },
              { name: 'Gikomba Gems', slug: 'gikomba-gems', location: 'Gikomba', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop' },
            ].map((store, i) => (
              <Link key={i} href={`/store/${store.slug}`} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-charcoal rounded-sm mb-6">
                  <Image src={store.img} alt={store.name} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-lime text-black text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter">Verified</span>
                  </div>
                </div>
                <h3 className="font-fashion text-2xl font-bold mb-2 group-hover:text-lime transition-colors">{store.name}</h3>
                <p className="font-display text-sm text-muted-gray uppercase tracking-widest">{store.location}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* The Aesthetic */}
        <section className="bg-charcoal py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="relative aspect-square">
              <Image 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
                alt="Editorial Look" 
                fill 
                className="object-cover grayscale rounded-sm shadow-2xl" 
              />
              <div className="absolute -bottom-10 -right-10 bg-lime p-12 hidden md:block">
                <h3 className="font-editorial italic text-5xl text-black">Quality <br /> Over <br /> Quantity</h3>
              </div>
            </div>
            <div>
              <h2 className="font-fashion text-5xl md:text-7xl font-bold mb-10 leading-none">REDEFINING <br /> NAIROBI <br /> THRIFT</h2>
              <p className="font-display text-lg text-muted-gray mb-12 leading-relaxed">
                Gone are the days of endless digging in the mud. We&apos;ve brought together the most trusted sellers in Kenya to offer a seamless, secure, and stylish shopping experience.
              </p>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <h4 className="text-lime font-black text-3xl mb-2">100%</h4>
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Escrow Protected</p>
                </div>
                <div>
                  <h4 className="text-lime font-black text-3xl mb-2">24H</h4>
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Courier Dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

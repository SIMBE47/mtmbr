"use client"

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Star } from 'lucide-react'

export default function Stores() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStores() {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) {
        console.error(error)
      } else {
        setStores(data || [])
      }
      setLoading(false)
    }

    fetchStores()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <div>
              <h1 className="font-fashion text-6xl md:text-8xl font-bold tracking-tighter mb-4">BOUTIQUES</h1>
              <p className="font-editorial italic text-2xl text-muted-gray">Independent shops, curated by locals.</p>
            </div>
            
            <div className="w-full md:w-auto">
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-lime transition-colors" size={18} />
                 <input 
                   type="text" 
                   placeholder="FIND A BOUTIQUE..." 
                   className="bg-charcoal border border-white/10 rounded-full pl-12 pr-6 py-4 w-full md:w-80 font-display text-sm focus:outline-none focus:border-lime transition-all"
                 />
               </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-charcoal h-64 rounded-sm mb-4" />
                  <div className="bg-charcoal h-6 w-3/4 rounded-full mb-2" />
                  <div className="bg-charcoal h-4 w-1/4 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {stores.map((store) => (
                <Link key={store.id} href={`/store/${store.slug}`} className="group bg-charcoal border border-white/5 rounded-sm p-10 hover:border-lime/30 transition-all">
                  <div className="flex justify-between items-start mb-8">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-soft-black border border-white/10">
                      <Image src={store.logo_image || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop'} alt={store.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                    <div className="flex items-center gap-1 font-display text-xs font-bold text-lime">
                      <Star size={14} fill="currentColor" />
                      <span>{store.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-fashion text-3xl font-bold mb-4 group-hover:text-lime transition-colors leading-tight uppercase tracking-tight">{store.name}</h3>
                  <p className="font-editorial italic text-lg text-muted-gray mb-8 line-clamp-2">{store.description}</p>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-white/5 font-display">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      <MapPin size={12} />
                      <span>{store.location}</span>
                    </div>
                    <span className="text-[10px] font-black bg-white/5 text-white/50 px-3 py-1 rounded-full">{store.sales_count} SALES</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

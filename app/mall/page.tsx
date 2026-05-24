"use client"

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function Mall() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories', 'Outerwear']

  useEffect(() => {
    async function fetchListings() {
      let query = supabase.from('listings').select('*').eq('status', 'available')
      
      if (category !== 'All') {
        query = query.eq('category', category)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        console.error(error)
      } else {
        setListings(data || [])
      }
      setLoading(false)
    }

    fetchListings()
  }, [category])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <div>
              <h1 className="font-fashion text-6xl md:text-8xl font-bold tracking-tighter mb-4">THE MALL</h1>
              <p className="font-editorial italic text-2xl text-muted-gray">Browsing all verified inventory in Nairobi.</p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col gap-4">
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-lime transition-colors" size={18} />
                 <input 
                   type="text" 
                   placeholder="SEARCH THE MALL..." 
                   className="bg-charcoal border border-white/10 rounded-full pl-12 pr-6 py-4 w-full md:w-80 font-display text-sm focus:outline-none focus:border-lime transition-all"
                 />
               </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex overflow-x-auto pb-6 gap-4 no-scrollbar border-b border-white/5 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`font-display text-xs font-black px-6 py-3 rounded-full transition-all whitespace-nowrap ${
                  category === cat 
                    ? "bg-lime text-black" 
                    : "bg-charcoal text-white/50 hover:bg-white/5"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-charcoal aspect-[4/5] rounded-sm mb-4" />
                  <div className="bg-charcoal h-4 w-3/4 rounded-full mb-2" />
                  <div className="bg-charcoal h-4 w-1/4 rounded-full" />
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {listings.map((listing) => (
                <Link key={listing.id} href={`/listing/${listing.id}`} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-charcoal rounded-sm mb-6">
                    <Image 
                      src={listing.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'} 
                      alt={listing.name} 
                      fill 
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="bg-white text-black text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter">
                        SIZE {listing.size}
                      </span>
                      <span className="bg-lime text-black text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter">
                        GRADE {listing.grade}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-sm mb-1 group-hover:text-lime transition-colors uppercase tracking-tight">{listing.name}</h3>
                      <p className="font-display text-[10px] text-muted-gray uppercase tracking-widest">{listing.store_name}</p>
                    </div>
                    <span className="font-display font-black text-sm">{formatCurrency(listing.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center">
              <p className="font-editorial italic text-3xl text-muted-gray">Nothing here yet. Try another category.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

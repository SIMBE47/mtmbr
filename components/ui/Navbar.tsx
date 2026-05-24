"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ShoppingBag, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-soft-black/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bubbly text-2xl font-bold text-lime tracking-tight">
          THRIFTR
        </Link>

        <div className="hidden md:flex items-center gap-8 font-display text-sm font-medium tracking-wide">
          <Link href="/mall" className="hover:text-lime transition-colors">THE MALL</Link>
          <Link href="/stores" className="hover:text-lime transition-colors">BOUTIQUES</Link>
          {user && <Link href="/messages" className="hover:text-lime transition-colors">MESSAGES</Link>}
          <Link href="/enroll" className="hover:text-lime transition-colors text-xs border border-lime/30 px-3 py-1 rounded-full">SELL ON THRIFTR</Link>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/mall" className="hover:text-lime transition-colors">
            <ShoppingBag size={20} />
          </Link>
          {user ? (
            <Link href="/dashboard" className="hover:text-lime transition-colors">
              <User size={20} />
            </Link>
          ) : (
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              className="font-display text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-lime transition-colors"
            >
              LOGIN
            </button>
          )}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-charcoal border-b border-white/10 p-6 flex flex-col gap-6 font-display font-bold">
          <Link href="/mall" onClick={() => setIsMobileMenuOpen(false)}>THE MALL</Link>
          <Link href="/stores" onClick={() => setIsMobileMenuOpen(false)}>BOUTIQUES</Link>
          {user && <Link href="/messages" onClick={() => setIsMobileMenuOpen(false)}>MESSAGES</Link>}
          <Link href="/enroll" onClick={() => setIsMobileMenuOpen(false)}>SELL ON THRIFTR</Link>
        </div>
      )}
    </nav>
  )
}

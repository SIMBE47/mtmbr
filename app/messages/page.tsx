"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { supabase } from '@/lib/supabase'
import { Send } from 'lucide-react'

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedConversation = searchParams.get('conversation')
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      setUserId(user.id)

      const { data: convs, error: convError } = await supabase
        .from('conversations')
        .select('id, store_id, listing_id, created_at, stores(name, logo_image), listings(name)')
        .order('updated_at', { ascending: false })

      if (convError) {
        console.error(convError)
      }

      const safeConvs = convs || []
      setConversations(safeConvs)

      const conversationId = selectedConversation || safeConvs[0]?.id
      if (conversationId) {
        await loadMessages(conversationId)
      }

      setLoading(false)
    }

    load()
  }, [router, selectedConversation])

  async function loadMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setMessages(data || [])
  }

  async function sendMessage() {
    const conversationId = selectedConversation || conversations[0]?.id
    if (!conversationId || !userId || !body.trim()) return

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        body: body.trim()
      })
      .select('*')
      .single()

    if (error) {
      console.error(error)
      alert('Message could not be sent.')
      return
    }

    setMessages([...messages, data])
    setBody('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-black flex items-center justify-center">
        <div className="font-bubbly text-4xl animate-pulse text-lime">MESSAGES...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[320px_1fr] gap-8">
          <aside className="bg-charcoal border border-white/5 rounded-sm p-4 h-fit">
            <h1 className="font-fashion text-3xl font-bold uppercase mb-6">Messages</h1>
            <div className="space-y-2">
              {conversations.length === 0 && (
                <p className="text-sm text-muted-gray">No conversations yet. Open a listing and message a store.</p>
              )}
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => router.push(`/messages?conversation=${conversation.id}`)}
                  className={`w-full text-left p-4 rounded-sm border transition-all ${
                    (selectedConversation || conversations[0]?.id) === conversation.id
                      ? 'border-lime bg-lime/10'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <p className="font-display text-xs font-black uppercase">{conversation.stores?.name || 'Store'}</p>
                  <p className="text-[10px] text-muted-gray uppercase mt-1">{conversation.listings?.name || 'General conversation'}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="bg-charcoal border border-white/5 rounded-sm min-h-[620px] flex flex-col">
            <div className="p-6 border-b border-white/5">
              <h2 className="font-fashion text-4xl font-bold uppercase">Buyer / Store Chat</h2>
              <p className="text-sm text-muted-gray">Keep questions, condition checks, pickup details, and trust inside THRIFTR.</p>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {messages.length === 0 && (
                <div className="text-center py-24">
                  <p className="font-editorial italic text-2xl text-muted-gray">No messages yet.</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[76%] p-4 rounded-sm ${
                    message.sender_id === userId
                      ? 'ml-auto bg-lime text-black'
                      : 'bg-soft-black border border-white/10 text-off-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.body}</p>
                  <p className="text-[9px] opacity-50 mt-2 uppercase">{new Date(message.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 flex gap-3">
              <input
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') sendMessage()
                }}
                placeholder="Type a message..."
                className="flex-1 bg-soft-black border border-white/10 rounded-full px-5 py-4 text-sm outline-none focus:border-lime"
              />
              <button
                onClick={sendMessage}
                className="bg-lime text-black rounded-full px-6 font-display font-black text-xs uppercase flex items-center gap-2"
              >
                <Send size={16} /> Send
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-soft-black flex items-center justify-center">
        <div className="font-bubbly text-4xl animate-pulse text-lime">MESSAGES...</div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}

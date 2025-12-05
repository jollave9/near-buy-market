'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { User } from '@supabase/supabase-js'
import { Send } from 'lucide-react'
import { formatDistance as formatDate } from 'date-fns'

interface Conversation {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  last_message: string | null
  last_message_at: string | null
  products: {
    title: string
    price: number
    images: string[]
  }
  buyer: {
    full_name: string | null
  }
  seller: {
    full_name: string | null
  }
}

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  profiles: {
    full_name: string | null
  }
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const selectedConvId = searchParams?.get('conversation')
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(selectedConvId)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          products (
            title,
            price,
            images
          ),
          buyer:profiles!conversations_buyer_id_fkey (
            full_name
          ),
          seller:profiles!conversations_seller_id_fkey (
            full_name
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (!error && data) {
        setConversations(data as any)
      }
    }

    fetchConversations()

    const channel = supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
      }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    if (!selectedConversation) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    fetchMessages()

    const channel = supabase
      .channel(`messages:${selectedConversation}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation}`,
      }, (payload) => {
        fetchMessages()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !selectedConversation) return

    setLoading(true)

    const conversation = conversations.find(c => c.id === selectedConversation)
    if (!conversation) return

    const receiverId = conversation.buyer_id === user.id
      ? conversation.seller_id
      : conversation.buyer_id

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          receiver_id: receiverId,
          product_id: conversation.product_id,
          content: newMessage,
        })

      if (!error) {
        await supabase
          .from('conversations')
          .update({
            last_message: newMessage,
            last_message_at: new Date().toISOString(),
          })
          .eq('id', selectedConversation)

        setNewMessage('')
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          <Card className="md:col-span-1 overflow-auto">
            <div className="p-4">
              <h2 className="font-semibold mb-4">Conversations</h2>
              {conversations.length === 0 ? (
                <p className="text-sm text-gray-500">No conversations yet</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedConversation === conv.id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex gap-3">
                        {conv.products.images?.[0] && (
                          <img
                            src={conv.products.images[0]}
                            alt={conv.products.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {conv.products.title}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {conv.last_message || 'No messages yet'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user?.id === conv.buyer_id
                              ? conv.seller.full_name || 'Seller'
                              : conv.buyer.full_name || 'Buyer'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    {conversations.find(c => c.id === selectedConversation)?.products.images?.[0] && (
                      <img
                        src={conversations.find(c => c.id === selectedConversation)!.products.images[0]}
                        alt="Product"
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {conversations.find(c => c.id === selectedConversation)?.products.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ${conversations.find(c => c.id === selectedConversation)?.products.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatDate(new Date(message.created_at), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={loading}
                    />
                    <Button type="submit" disabled={loading || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

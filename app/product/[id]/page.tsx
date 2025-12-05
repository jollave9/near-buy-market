'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatDistance } from '@/utils/distance'
import { calculateDistance } from '@/utils/distance'
import { ArrowLeft, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react'
import { User } from '@supabase/supabase-js'

interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  latitude: number
  longitude: number
  created_at: string
  user_id: string
  profiles: {
    full_name: string | null
  }
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        }
      )
    }
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setProducts(data)
        const initialIndex = data.findIndex(p => p.id === params.id)
        if (initialIndex !== -1) {
          setCurrentIndex(initialIndex)
        }
      }
    }

    fetchProducts()
  }, [params.id])

  const handleNext = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1)
      router.push(`/product/${products[currentIndex + 1].id}`, { scroll: false })
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      router.push(`/product/${products[currentIndex - 1].id}`, { scroll: false })
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, products])

  const handleStartConversation = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    const product = products[currentIndex]
    if (!product) return

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('product_id', product.id)
      .eq('buyer_id', user.id)
      .single()

    if (existing) {
      router.push(`/messages?conversation=${existing.id}`)
    } else {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          product_id: product.id,
          buyer_id: user.id,
          seller_id: product.user_id,
        })
        .select()
        .single()

      if (!error && newConv) {
        router.push(`/messages?conversation=${newConv.id}`)
      }
    }
  }

  if (products.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  const product = products[currentIndex]
  const distance = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, product.latitude, product.longitude)
    : null

  return (
    <div className="h-screen bg-black overflow-hidden" ref={containerRef}>
      <div className="relative h-full">
        <button
          onClick={() => router.push('/feed')}
          className="absolute top-4 left-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[300px] z-40 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
          >
            <ChevronUp className="h-6 w-6" />
          </button>
        )}

        {currentIndex < products.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[240px] z-40 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
        )}

        <div className="h-full flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-gray-400 text-xl">No image available</div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                <p className="text-4xl font-bold text-green-400 mb-3">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-gray-200 mb-3 line-clamp-3">
                  {product.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  {distance !== null && (
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      {formatDistance(distance)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  Seller: {product.profiles?.full_name || 'Anonymous'}
                </p>
              </div>
            </div>

            {user && user.id !== product.user_id && (
              <Button
                onClick={handleStartConversation}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Message Seller
              </Button>
            )}

            <div className="text-center mt-4 text-sm text-gray-400">
              {currentIndex + 1} / {products.length} products
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

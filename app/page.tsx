'use client'

import { useChat } from 'ai/react'
import { useState, useRef, useEffect } from 'react'
import {  Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const messageCountRef = useRef(0)

  // Check if it's the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedChat')
    if (!hasVisited) {
      setShowWelcome(true)
      localStorage.setItem('hasVisitedChat', 'true')
    }
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (messageCountRef.current >= 5 && !localStorage.getItem('openai_api_key')) {
      setShowApiKeyDialog(true)
      return
    }
    
    messageCountRef.current += 1
    await handleSubmit(e)
  }

  const handleApiKeySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    localStorage.setItem('openai_api_key', apiKey)
    setShowApiKeyDialog(false)
  }

  if (!mounted) return null

  return (
    <>
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/pfp.jpg" />
              </Avatar>
              hey, i&apos;m ishan
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-left space-y-2">
                im an ai version of ishan. im trained to mimic his texting habits and will talk about anything he likes.       
                <div className="mt-2">
                  feel free to ask me about anything but keep i mind nothing i say are endorsed by my creator...
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter your OpenAI API Key</DialogTitle>
            <DialogDescription>
              To continue chatting, please enter your OpenAI API key. You can get one from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI&apos;s website
              </a>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApiKeySubmit}>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!apiKey.startsWith('sk-')}>
                Save API Key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
        <Card className="w-full max-w-2xl h-[600px] grid grid-rows-[auto_1fr_auto]">
          <CardHeader className="border-b flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <a href="https://ishankr.com"><AvatarImage src="/pfp.jpg" /></a>
              </Avatar>
              <div className='block'>
              <p className="text-xs">an AI version of </p>
              ishan buyyanapragada
              </div>
            </CardTitle>
            <ThemeToggle />
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea ref={scrollAreaRef} className="h-full p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`flex items-start gap-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <Avatar className="h-8 w-8">
                      {message.role === 'user' ? (
                        <>
                          <AvatarFallback>U</AvatarFallback>
                          <AvatarImage src="/default_pfp.svg" />
                        </>
                      ) : (
                        <>
                          <AvatarFallback>AI</AvatarFallback>
                          <AvatarImage src="/pfp.jpg" />
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted dark:bg-muted/50 text-secondary-foreground'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="mb-4 flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg bg-muted dark:bg-muted/50 px-4 py-2">
                    <div className="animate-pulse">...</div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t p-4">
            <form
              onSubmit={handleFormSubmit}
              className="flex w-full items-center gap-2"
            >
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}


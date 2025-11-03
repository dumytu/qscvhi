import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { MessageCircle, Send, Users, User, Podcast as Broadcast, Filter } from 'lucide-react'
import type { Message, Student, Class } from '../../lib/supabase'

export default function MessagesManagement() {
  const [messages, setMessages] = useState<Message[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedChat, setSelectedChat] = useState<'broadcast' | 'class' | 'student' | null>(null)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadClasses()
    loadStudents()
  }, [])

  useEffect(() => {
    if (selectedChat) {
      loadMessages()
    }
  }, [selectedChat, selectedClassId, selectedStudentId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('class_number', { ascending: true })

      if (data && !error) {
        setClasses(data)
      }
    } catch (error) {
      console.error('Error loading classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(*)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (data && !error) {
        setStudents(data)
      }
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const loadMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .order('sent_at', { ascending: true })
        .limit(100)

      if (selectedChat === 'broadcast') {
        query = query.eq('message_type', 'broadcast')
      } else if (selectedChat === 'class' && selectedClassId) {
        query = query.eq('message_type', 'group').eq('class_id', selectedClassId)
      } else if (selectedChat === 'student' && selectedStudentId) {
        query = query.eq('message_type', 'personal').eq('receiver_id', selectedStudentId)
      }

      const { data, error } = await query

      if (data && !error) {
        setMessages(data)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    setSending(true)
    try {
      const messageData: any = {
        sender_type: 'admin',
        content: newMessage.trim(),
        sent_at: new Date().toISOString()
      }

      if (selectedChat === 'broadcast') {
        messageData.message_type = 'broadcast'
      } else if (selectedChat === 'class' && selectedClassId) {
        messageData.message_type = 'group'
        messageData.class_id = selectedClassId
      } else if (selectedChat === 'student' && selectedStudentId) {
        messageData.message_type = 'personal'
        messageData.receiver_id = selectedStudentId
        messageData.receiver_type = 'student'
      }

      const { error } = await supabase
        .from('messages')
        .insert(messageData)

      if (!error) {
        setNewMessage('')
        loadMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    
    messages.forEach(message => {
      const date = new Date(message.sent_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  const getChatTitle = () => {
    if (selectedChat === 'broadcast') return 'Broadcast to All Students'
    if (selectedChat === 'class' && selectedClassId) {
      const className = classes.find(c => c.id === selectedClassId)?.name
      return `Class Group - ${className}`
    }
    if (selectedChat === 'student' && selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId)
      return `Personal Chat - ${student?.name}`
    }
    return 'Select Chat Type'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-2">Messages Management</h1>
        <p className="opacity-90">Communicate with students and classes</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Selection Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 text-blue-600 mr-2" />
              Chat Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Broadcast Option */}
            <div
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedChat === 'broadcast' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => {
                setSelectedChat('broadcast')
                setSelectedClassId('')
                setSelectedStudentId('')
              }}
            >
              <div className="flex items-center">
                <Broadcast className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Broadcast</h4>
                  <p className="text-sm text-gray-600">Send to all students</p>
                </div>
              </div>
            </div>

            {/* Class Groups */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Class Groups</h4>
              <div className="space-y-2">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === 'class' && selectedClassId === cls.id 
                        ? 'bg-green-100 border-2 border-green-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedChat('class')
                      setSelectedClassId(cls.id)
                      setSelectedStudentId('')
                    }}
                  >
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">{cls.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Students */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Students</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {students.slice(0, 20).map((student) => (
                  <div
                    key={student.id}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === 'student' && selectedStudentId === student.id 
                        ? 'bg-blue-100 border-2 border-blue-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedChat('student')
                      setSelectedStudentId(student.id)
                      setSelectedClassId('')
                    }}
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.class?.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
              {getChatTitle()}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {selectedChat ? (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {Object.entries(messageGroups).map(([date, dateMessages]) => (
                    <div key={date}>
                      {/* Date Separator */}
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                          {formatDate(dateMessages[0].sent_at)}
                        </div>
                      </div>

                      {/* Messages for this date */}
                      {dateMessages.map((message) => (
                        <div key={message.id} className="flex justify-end">
                          <div className="max-w-xs lg:max-w-md">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                              <div className="flex items-center mb-1">
                                <User className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">Admin</span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                              <div className="text-xs text-blue-100 mt-1">
                                {formatTime(message.sent_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Type your message to ${getChatTitle().toLowerCase()}...`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      className="flex-1"
                      disabled={sending}
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Press Enter to send</span>
                    <span>{newMessage.length}/500</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Chat</h3>
                  <p className="text-gray-600">Choose broadcast, class group, or individual student to start messaging.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
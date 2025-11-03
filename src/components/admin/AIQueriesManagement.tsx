import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Brain, MessageSquare, User, Bot, ArrowRight, CheckCircle, Clock, Filter } from 'lucide-react'
import type { AIQuery, Student } from '../../lib/supabase'

export default function AIQueriesManagement() {
  const [queries, setQueries] = useState<AIQuery[]>([])
  const [selectedQuery, setSelectedQuery] = useState<AIQuery | null>(null)
  const [teacherResponse, setTeacherResponse] = useState('')
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadQueries()
  }, [])

  const loadQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_queries')
        .select(`
          *,
          student:students(*, class:classes(*))
        `)
        .order('created_at', { ascending: false })

      if (data && !error) {
        setQueries(data)
      }
    } catch (error) {
      console.error('Error loading queries:', error)
    } finally {
      setLoading(false)
    }
  }

  const respondToQuery = async () => {
    if (!selectedQuery || !teacherResponse.trim()) return

    setResponding(true)
    try {
      const { error } = await supabase
        .from('ai_queries')
        .update({
          teacher_response: teacherResponse.trim(),
          resolved_at: new Date().toISOString()
        })
        .eq('id', selectedQuery.id)

      if (!error) {
        setQueries(prev => prev.map(q => 
          q.id === selectedQuery.id 
            ? { ...q, teacher_response: teacherResponse.trim(), resolved_at: new Date().toISOString() }
            : q
        ))
        setSelectedQuery(prev => prev ? { ...prev, teacher_response: teacherResponse.trim(), resolved_at: new Date().toISOString() } : null)
        setTeacherResponse('')
        alert('Response sent successfully!')
      }
    } catch (error) {
      console.error('Error responding to query:', error)
      alert('Error sending response')
    } finally {
      setResponding(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSubjects = () => {
    const subjects = Array.from(new Set(queries.map(q => q.subject).filter(Boolean)))
    return ['all', ...subjects]
  }

  const filteredQueries = queries.filter(query => {
    const matchesSubject = subjectFilter === 'all' || query.subject === subjectFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'forwarded' && query.is_forwarded_to_teacher) ||
      (statusFilter === 'resolved' && query.teacher_response) ||
      (statusFilter === 'pending' && query.is_forwarded_to_teacher && !query.teacher_response)
    
    return matchesSubject && matchesStatus
  })

  const stats = {
    total: queries.length,
    forwarded: queries.filter(q => q.is_forwarded_to_teacher).length,
    resolved: queries.filter(q => q.teacher_response).length,
    pending: queries.filter(q => q.is_forwarded_to_teacher && !q.teacher_response).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Queries Management</h1>
          <p className="text-gray-600">Review and respond to student AI queries</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ArrowRight className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Forwarded</p>
                <p className="text-2xl font-bold text-gray-900">{stats.forwarded}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 text-blue-600 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                {getSubjects().map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Queries</option>
                <option value="forwarded">Forwarded to Teacher</option>
                <option value="pending">Pending Response</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredQueries.length} queries
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queries List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
              AI Queries ({filteredQueries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredQueries.map((query) => (
                <div
                  key={query.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedQuery?.id === query.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedQuery(query)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {query.subject && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {query.subject}
                        </span>
                      )}
                      {query.is_forwarded_to_teacher && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Forwarded
                        </span>
                      )}
                      {query.teacher_response && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolved
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(query.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900 mb-2 line-clamp-2 font-medium">
                    {query.query}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    <span>{query.student?.name} - {query.student?.class?.name}</span>
                  </div>
                </div>
              ))}
              
              {filteredQueries.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No queries found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Query Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
              Query Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedQuery ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {selectedQuery.subject && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {selectedQuery.subject}
                      </span>
                    )}
                    {selectedQuery.is_forwarded_to_teacher && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Forwarded
                      </span>
                    )}
                    {selectedQuery.teacher_response && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedQuery.student?.name}</p>
                      <p><strong>Class:</strong> {selectedQuery.student?.class?.name}</p>
                      <p><strong>Roll Number:</strong> {selectedQuery.student?.roll_number}</p>
                      <p><strong>Query Date:</strong> {new Date(selectedQuery.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Student Query */}
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="max-w-xs lg:max-w-md">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                        <div className="flex items-center mb-1">
                          <User className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">{selectedQuery.student?.name}</span>
                        </div>
                        <p className="text-sm">{selectedQuery.query}</p>
                        <div className="text-xs text-blue-100 mt-1">
                          {formatTime(selectedQuery.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Response */}
                  {selectedQuery.ai_response && (
                    <div className="flex justify-start">
                      <div className="max-w-xs lg:max-w-md">
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <div className="flex items-center mb-1">
                            <Bot className="h-4 w-4 mr-2 text-indigo-600" />
                            <span className="text-sm font-medium">AI Assistant</span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{selectedQuery.ai_response}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Teacher Response */}
                  {selectedQuery.teacher_response && (
                    <div className="flex justify-start">
                      <div className="max-w-xs lg:max-w-md">
                        <div className="bg-green-100 text-green-900 px-4 py-2 rounded-lg border border-green-200">
                          <div className="flex items-center mb-1">
                            <User className="h-4 w-4 mr-2 text-green-600" />
                            <span className="text-sm font-medium">Teacher</span>
                          </div>
                          <p className="text-sm">{selectedQuery.teacher_response}</p>
                          {selectedQuery.resolved_at && (
                            <div className="text-xs text-green-600 mt-1">
                              {formatTime(selectedQuery.resolved_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Response Form */}
                {selectedQuery.is_forwarded_to_teacher && !selectedQuery.teacher_response && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teacher Response
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-md resize-none h-32"
                        value={teacherResponse}
                        onChange={(e) => setTeacherResponse(e.target.value)}
                        placeholder="Provide detailed explanation and guidance..."
                      />
                    </div>
                    
                    <Button
                      onClick={respondToQuery}
                      disabled={responding || !teacherResponse.trim()}
                      className="w-full"
                    >
                      {responding ? 'Sending Response...' : 'Send Response'}
                    </Button>
                  </div>
                )}

                {!selectedQuery.is_forwarded_to_teacher && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      This query has not been forwarded to teachers yet. The student can forward it if they need additional help.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a query to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
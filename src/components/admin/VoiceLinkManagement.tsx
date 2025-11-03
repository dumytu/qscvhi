import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Heart, Calendar, Clock, CheckCircle, XCircle, Video, MessageSquare, User } from 'lucide-react'
import type { VoiceLinkRequest, Student } from '../../lib/supabase'

export default function VoiceLinkManagement() {
  const [requests, setRequests] = useState<VoiceLinkRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<VoiceLinkRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('voicelink_requests')
        .select(`
          *,
          student:students(*, class:classes(*))
        `)
        .order('created_at', { ascending: false })

      if (data && !error) {
        setRequests(data)
      }
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (requestId: string, status: string, notes = '') => {
    try {
      const updateData: any = { status, notes }
      
      if (status === 'approved') {
        // Set a default scheduled time (can be customized)
        const scheduledTime = new Date()
        scheduledTime.setDate(scheduledTime.getDate() + 1) // Tomorrow
        scheduledTime.setHours(10, 0, 0, 0) // 10 AM
        
        updateData.scheduled_time = scheduledTime.toISOString()
        updateData.meeting_link = `https://meet.google.com/new` // In production, generate actual meeting links
      }

      const { error } = await supabase
        .from('voicelink_requests')
        .update(updateData)
        .eq('id', requestId)

      if (!error) {
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status, notes, ...updateData }
            : req
        ))
        alert(`Request ${status} successfully!`)
      }
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Error updating request')
    }
  }

  const scheduleSession = async (requestId: string, scheduledTime: string, meetingLink: string) => {
    try {
      const { error } = await supabase
        .from('voicelink_requests')
        .update({
          scheduled_time: scheduledTime,
          meeting_link: meetingLink,
          status: 'approved'
        })
        .eq('id', requestId)

      if (!error) {
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, scheduled_time: scheduledTime, meeting_link: meetingLink, status: 'approved' }
            : req
        ))
        alert('Session scheduled successfully!')
      }
    } catch (error) {
      console.error('Error scheduling session:', error)
      alert('Error scheduling session')
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'personal':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'emotional':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredRequests = requests.filter(request => 
    statusFilter === 'all' || request.status === statusFilter
  )

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length
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
          <h1 className="text-2xl font-bold text-gray-900">VoiceLink Management</h1>
          <p className="text-gray-600">Manage student counselling requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing {filteredRequests.length} requests
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 text-red-600 mr-2" />
              Counselling Requests ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedRequest?.id === request.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(request.type)}`}>
                        {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status.toUpperCase()}</span>
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-medium text-gray-900 mb-1">{request.subject}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    <span>{request.student?.name} - {request.student?.class?.name}</span>
                  </div>

                  {request.scheduled_time && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Scheduled: {new Date(request.scheduled_time).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {filteredRequests.length === 0 && (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No requests found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(selectedRequest.type)}`}>
                      {selectedRequest.type.charAt(0).toUpperCase() + selectedRequest.type.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1">{selectedRequest.status.toUpperCase()}</span>
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedRequest.subject}
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedRequest.student?.name}</p>
                      <p><strong>Class:</strong> {selectedRequest.student?.class?.name}</p>
                      <p><strong>Roll Number:</strong> {selectedRequest.student?.roll_number}</p>
                      <p><strong>Request Date:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                      {selectedRequest.description}
                    </p>
                  </div>
                </div>

                {selectedRequest.scheduled_time && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Scheduled Session</h4>
                    <div className="space-y-2 text-sm text-green-800">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(selectedRequest.scheduled_time).toLocaleString()}</span>
                      </div>
                      {selectedRequest.meeting_link && (
                        <div className="flex items-center">
                          <Video className="h-4 w-4 mr-2" />
                          <a 
                            href={selectedRequest.meeting_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedRequest.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Counsellor Notes</h4>
                    <p className="text-blue-800 text-sm">{selectedRequest.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t pt-4 space-y-4">
                  {selectedRequest.status === 'pending' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const reason = prompt('Reason for rejection:')
                            if (reason) {
                              updateRequestStatus(selectedRequest.id, 'rejected', reason)
                            }
                          }}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Schedule Session (Optional)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="datetime-local"
                            className="flex-1"
                            id="scheduled-time"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              const timeInput = document.getElementById('scheduled-time') as HTMLInputElement
                              if (timeInput.value) {
                                scheduleSession(
                                  selectedRequest.id, 
                                  timeInput.value, 
                                  'https://meet.google.com/new'
                                )
                              }
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRequest.status === 'approved' && (
                    <Button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Add Notes
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md resize-none h-20"
                      placeholder="Add counsellor notes..."
                      id="counsellor-notes"
                      defaultValue={selectedRequest.notes || ''}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const notesTextarea = document.getElementById('counsellor-notes') as HTMLTextAreaElement
                        updateRequestStatus(selectedRequest.id, selectedRequest.status, notesTextarea.value)
                      }}
                    >
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a request to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
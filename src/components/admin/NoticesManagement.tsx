import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Bell, Plus, Calendar, AlertTriangle, Eye, CreditCard as Edit, Trash2 } from 'lucide-react'
import type { Notice, Class } from '../../lib/supabase'

export default function NoticesManagement() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    target_class: 'all',
    expiry_date: ''
  })

  useEffect(() => {
    loadNotices()
    loadClasses()
  }, [])

  const loadNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('publish_date', { ascending: false })

      if (data && !error) {
        setNotices(data)
      }
    } catch (error) {
      console.error('Error loading notices:', error)
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const noticeData = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        target_class: formData.target_class,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        is_active: true
      }

      if (editingNotice) {
        // Update existing notice
        const { error } = await supabase
          .from('notices')
          .update(noticeData)
          .eq('id', editingNotice.id)

        if (!error) {
          alert('Notice updated successfully!')
          resetForm()
          loadNotices()
        }
      } else {
        // Add new notice
        const { error } = await supabase
          .from('notices')
          .insert(noticeData)

        if (!error) {
          alert('Notice created successfully!')
          resetForm()
          loadNotices()
        }
      }
    } catch (error) {
      console.error('Error saving notice:', error)
      alert('Error saving notice: ' + (error as any).message)
    }
  }

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice)
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      target_class: notice.target_class,
      expiry_date: notice.expiry_date ? notice.expiry_date.split('T')[0] : ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return

    try {
      const { error } = await supabase
        .from('notices')
        .update({ is_active: false })
        .eq('id', noticeId)

      if (!error) {
        alert('Notice deleted successfully!')
        loadNotices()
      }
    } catch (error) {
      console.error('Error deleting notice:', error)
      alert('Error deleting notice')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      target_class: 'all',
      expiry_date: ''
    })
    setEditingNotice(null)
    setShowAddForm(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Bell className="h-4 w-4" />
      case 'low':
        return <Calendar className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return new Date() > new Date(expiryDate)
  }

  const activeNotices = notices.filter(notice => notice.is_active && !isExpired(notice.expiry_date))
  const expiredNotices = notices.filter(notice => notice.is_active && isExpired(notice.expiry_date))

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
          <h1 className="text-2xl font-bold text-gray-900">Notices Management</h1>
          <p className="text-gray-600">Create and manage school announcements</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Notice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Notices</p>
                <p className="text-2xl font-bold text-gray-900">{activeNotices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeNotices.filter(n => n.priority === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{expiredNotices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingNotice ? 'Edit Notice' : 'Create New Notice'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Notice title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    value={formData.target_class}
                    onChange={(e) => setFormData({...formData, target_class: e.target.value})}
                  >
                    <option value="all">All Classes</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md resize-none h-32"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Notice content and details"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Notices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 text-blue-600 mr-2" />
            Active Notices ({activeNotices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeNotices.map((notice) => (
              <div key={notice.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                        {getPriorityIcon(notice.priority)}
                        <span className="ml-1">{notice.priority.toUpperCase()}</span>
                      </span>
                      {notice.target_class !== 'all' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          {notice.target_class}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">{notice.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{notice.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Published: {new Date(notice.publish_date).toLocaleDateString()}
                      </div>
                      {notice.expiry_date && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expires: {new Date(notice.expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(notice)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(notice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {activeNotices.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active notices found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expired Notices */}
      {expiredNotices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-600 mr-2" />
              Expired Notices ({expiredNotices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiredNotices.slice(0, 5).map((notice) => (
                <div key={notice.id} className="border rounded-lg p-4 opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-700 mb-1">{notice.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{notice.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>Published: {new Date(notice.publish_date).toLocaleDateString()}</span>
                        <span className="text-red-500">Expired</span>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(notice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
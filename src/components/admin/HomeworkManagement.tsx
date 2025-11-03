import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { FileText, Plus, Calendar, Clock, CheckCircle, Eye, Edit, Trash2 } from 'lucide-react'
import type { Homework, Class, Submission } from '../../lib/supabase'

export default function HomeworkManagement() {
  const [homework, setHomework] = useState<Homework[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedHomework, setSelectedHomework] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class_id: '',
    deadline: ''
  })

  useEffect(() => {
    loadHomework()
    loadClasses()
  }, [])

  const loadHomework = async () => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .select(`
          *,
          class:classes(*)
        `)
        .order('created_at', { ascending: false })

      if (data && !error) {
        setHomework(data)
      }
    } catch (error) {
      console.error('Error loading homework:', error)
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

  const loadSubmissions = async (homeworkId: string) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          student:students(*)
        `)
        .eq('homework_id', homeworkId)
        .order('submitted_at', { ascending: false })

      if (data && !error) {
        setSubmissions(data)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const homeworkData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        class_id: formData.class_id,
        deadline: formData.deadline,
        is_active: true
      }

      if (editingHomework) {
        const { error } = await supabase
          .from('homework')
          .update(homeworkData)
          .eq('id', editingHomework.id)

        if (!error) {
          alert('Homework updated successfully!')
          resetForm()
          loadHomework()
        }
      } else {
        const { error } = await supabase
          .from('homework')
          .insert(homeworkData)

        if (!error) {
          alert('Homework created successfully!')
          resetForm()
          loadHomework()
        }
      }
    } catch (error) {
      console.error('Error saving homework:', error)
      alert('Error saving homework')
    }
  }

  const handleEdit = (hw: Homework) => {
    setEditingHomework(hw)
    setFormData({
      title: hw.title,
      description: hw.description || '',
      subject: hw.subject,
      class_id: hw.class_id,
      deadline: hw.deadline.split('T')[0] + 'T' + hw.deadline.split('T')[1].substring(0, 5)
    })
    setShowAddForm(true)
  }

  const handleDelete = async (homeworkId: string) => {
    if (!confirm('Are you sure you want to delete this homework?')) return

    try {
      const { error } = await supabase
        .from('homework')
        .update({ is_active: false })
        .eq('id', homeworkId)

      if (!error) {
        alert('Homework deleted successfully!')
        loadHomework()
      }
    } catch (error) {
      console.error('Error deleting homework:', error)
      alert('Error deleting homework')
    }
  }

  const gradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          grade,
          max_grade: 100,
          feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId)

      if (!error) {
        alert('Submission graded successfully!')
        if (selectedHomework) {
          loadSubmissions(selectedHomework)
        }
      }
    } catch (error) {
      console.error('Error grading submission:', error)
      alert('Error grading submission')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      class_id: '',
      deadline: ''
    })
    setEditingHomework(null)
    setShowAddForm(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Homework Management</h1>
          <p className="text-gray-600">Create and manage assignments</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Homework
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingHomework ? 'Edit Homework' : 'Create New Homework'}
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
                    placeholder="Homework title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Subject"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    value={formData.class_id}
                    onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md resize-none h-32"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Homework description and instructions"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingHomework ? 'Update Homework' : 'Create Homework'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Homework List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              All Homework ({homework.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {homework.map((hw) => (
                <div 
                  key={hw.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedHomework === hw.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedHomework(hw.id)
                    loadSubmissions(hw.id)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{hw.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{hw.subject} - {hw.class?.name}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {new Date(hw.deadline).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(hw.deadline) > new Date() ? 'Active' : 'Expired'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(hw)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(hw.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {homework.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No homework created yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submissions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              {selectedHomework ? 'Submissions' : 'Select Homework'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedHomework ? (
              <div className="space-y-4">
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{submission.student?.name}</h4>
                          <p className="text-sm text-gray-600">Roll: {submission.student?.roll_number}</p>
                          <p className="text-xs text-gray-500">
                            Submitted: {new Date(submission.submitted_at).toLocaleString()}
                          </p>
                        </div>
                        
                        {submission.grade > 0 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {submission.grade}/{submission.max_grade}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            Pending
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-sm text-gray-700">{submission.submission_text}</p>
                      </div>
                      
                      {submission.grade === 0 && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Grade (0-100)"
                              className="w-24"
                              id={`grade-${submission.id}`}
                              min="0"
                              max="100"
                            />
                            <Input
                              placeholder="Feedback"
                              className="flex-1"
                              id={`feedback-${submission.id}`}
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                const gradeInput = document.getElementById(`grade-${submission.id}`) as HTMLInputElement
                                const feedbackInput = document.getElementById(`feedback-${submission.id}`) as HTMLInputElement
                                const grade = parseInt(gradeInput.value)
                                const feedback = feedbackInput.value
                                
                                if (grade >= 0 && grade <= 100) {
                                  gradeSubmission(submission.id, grade, feedback)
                                }
                              }}
                            >
                              Grade
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {submission.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>Feedback:</strong> {submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select homework to view submissions.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
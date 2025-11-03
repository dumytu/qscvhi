import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Calendar, Users, CheckCircle, XCircle, Clock, Filter, Download } from 'lucide-react'
import type { Student, Class } from '../../lib/supabase'

interface Attendance {
  id: string
  student_id: string
  date: string
  subject: string
  is_present: boolean
  remarks: string
  created_at: string
  student?: Student
}

export default function AttendanceManagement() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [markingAttendance, setMarkingAttendance] = useState(false)

  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science']

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadStudents()
      loadAttendance()
    }
  }, [selectedClass, selectedDate])

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('class_number', { ascending: true })

      if (data && !error) {
        setClasses(data)
        if (data.length > 0 && !selectedClass) {
          setSelectedClass(data[0].id)
        }
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
        .select('*')
        .eq('class_id', selectedClass)
        .eq('is_active', true)
        .order('roll_number', { ascending: true })

      if (data && !error) {
        setStudents(data)
      }
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const loadAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students(*)
        `)
        .eq('date', selectedDate)
        .in('student_id', students.map(s => s.id))

      if (data && !error) {
        setAttendance(data)
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
    }
  }

  const markAttendance = async (studentId: string, isPresent: boolean, subject: string, remarks = '') => {
    try {
      // Check if attendance already exists
      const existingAttendance = attendance.find(
        a => a.student_id === studentId && a.subject === subject
      )

      if (existingAttendance) {
        // Update existing attendance
        const { error } = await supabase
          .from('attendance')
          .update({
            is_present: isPresent,
            remarks
          })
          .eq('id', existingAttendance.id)

        if (!error) {
          setAttendance(prev => prev.map(a => 
            a.id === existingAttendance.id 
              ? { ...a, is_present: isPresent, remarks }
              : a
          ))
        }
      } else {
        // Create new attendance record
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            student_id: studentId,
            date: selectedDate,
            subject,
            is_present: isPresent,
            remarks
          })
          .select('*')
          .single()

        if (data && !error) {
          // Reload attendance to get updated data with student info
          loadAttendance()
        }
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('Error marking attendance: ' + (error as any).message)
    }
  }

  const markAllPresent = async () => {
    if (!selectedSubject) {
      alert('Please select a subject first')
      return
    }

    setMarkingAttendance(true)
    try {
      for (const student of students) {
        await markAttendance(student.id, true, selectedSubject)
      }
      alert('All students marked present!')
    } catch (error) {
      console.error('Error marking all present:', error)
    } finally {
      setMarkingAttendance(false)
    }
  }

  const getAttendanceForStudent = (studentId: string, subject: string) => {
    return attendance.find(a => a.student_id === studentId && a.subject === subject)
  }

  const getAttendanceStats = () => {
    if (!selectedSubject) return { present: 0, absent: 0, total: students.length }
    
    const subjectAttendance = attendance.filter(a => a.subject === selectedSubject)
    const present = subjectAttendance.filter(a => a.is_present).length
    const absent = subjectAttendance.filter(a => !a.is_present).length
    
    return { present, absent, total: students.length }
  }

  const stats = getAttendanceStats()

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
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Mark and manage student attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={markAllPresent}
            disabled={markingAttendance || !selectedSubject}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Present
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 text-blue-600 mr-2" />
            Attendance Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {selectedClass ? `${students.length} students` : 'Select class'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {selectedSubject && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Not Marked</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total - stats.present - stats.absent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Marking */}
      {selectedClass && selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              Mark Attendance - {classes.find(c => c.id === selectedClass)?.name} - {selectedSubject}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => {
                const studentAttendance = getAttendanceForStudent(student.id, selectedSubject)
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-sm font-medium text-blue-600">
                          {student.roll_number}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">Roll: {student.roll_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={studentAttendance?.is_present === true ? "default" : "outline"}
                          onClick={() => markAttendance(student.id, true, selectedSubject)}
                          className={studentAttendance?.is_present === true ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={studentAttendance?.is_present === false ? "default" : "outline"}
                          onClick={() => markAttendance(student.id, false, selectedSubject)}
                          className={studentAttendance?.is_present === false ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Absent
                        </Button>
                      </div>
                      
                      <Input
                        placeholder="Remarks (optional)"
                        className="w-40"
                        value={studentAttendance?.remarks || ''}
                        onChange={(e) => {
                          if (studentAttendance) {
                            markAttendance(student.id, studentAttendance.is_present, selectedSubject, e.target.value)
                          }
                        }}
                      />
                    </div>
                  </div>
                )
              })}
              
              {students.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No students found in selected class.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Class to Begin</h3>
            <p className="text-gray-600">Choose a class and subject to start marking attendance.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
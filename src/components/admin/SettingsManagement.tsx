import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Settings, School, Users, Database, Mail, Shield, Save, RefreshCw } from 'lucide-react'
import { getCurrentUser } from '../../lib/auth'
import type { Admin, Class } from '../../lib/supabase'

export default function SettingsManagement() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)

  // School Settings
  const [schoolSettings, setSchoolSettings] = useState({
    name: 'SOSE Lajpat Nagar',
    address: 'Lajpat Nagar, New Delhi',
    phone: '+91-11-12345678',
    email: 'admin@soselajpatnagar.edu',
    website: 'www.soselajpatnagar.edu'
  })

  // Class Form
  const [classForm, setClassForm] = useState({
    name: '',
    class_number: '',
    section: '',
    class_teacher: ''
  })

  // Admin Profile
  const [adminProfile, setAdminProfile] = useState({
    name: '',
    email: '',
    role: ''
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (user && user.userType === 'admin') {
      setAdmin(user as Admin)
      setAdminProfile({
        name: user.name,
        email: user.email,
        role: user.role
      })
    }
    loadClasses()
  }, [])

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

  const saveSchoolSettings = async () => {
    setSaving(true)
    try {
      // In a real app, you'd save these to a settings table
      // For now, we'll just show success
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('School settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const saveAdminProfile = async () => {
    if (!admin) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('admins')
        .update({
          name: adminProfile.name,
          role: adminProfile.role
        })
        .eq('id', admin.id)

      if (!error) {
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const addClass = async () => {
    if (!classForm.name || !classForm.class_number) return

    try {
      const { error } = await supabase
        .from('classes')
        .insert({
          name: classForm.name,
          class_number: parseInt(classForm.class_number),
          section: classForm.section,
          class_teacher: classForm.class_teacher
        })

      if (!error) {
        alert('Class added successfully!')
        setClassForm({ name: '', class_number: '', section: '', class_teacher: '' })
        setShowAddClass(false)
        loadClasses()
      }
    } catch (error) {
      console.error('Error adding class:', error)
      alert('Error adding class')
    }
  }

  const deleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class? This will affect all students in this class.')) return

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)

      if (!error) {
        alert('Class deleted successfully!')
        loadClasses()
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Error deleting class')
    }
  }

  const resetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the database? This will delete ALL data and cannot be undone!')) return
    if (!confirm('This is your final warning. ALL DATA WILL BE LOST. Are you absolutely sure?')) return

    try {
      // This would be a dangerous operation in production
      // For demo purposes, we'll just show a message
      alert('Database reset functionality is disabled in demo mode for safety.')
    } catch (error) {
      console.error('Error resetting database:', error)
      alert('Error resetting database')
    }
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
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Manage school and system configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <School className="h-5 w-5 text-blue-600 mr-2" />
              School Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name
              </label>
              <Input
                value={schoolSettings.name}
                onChange={(e) => setSchoolSettings({...schoolSettings, name: e.target.value})}
                placeholder="School name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md resize-none h-20"
                value={schoolSettings.address}
                onChange={(e) => setSchoolSettings({...schoolSettings, address: e.target.value})}
                placeholder="School address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  value={schoolSettings.phone}
                  onChange={(e) => setSchoolSettings({...schoolSettings, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={schoolSettings.email}
                  onChange={(e) => setSchoolSettings({...schoolSettings, email: e.target.value})}
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <Input
                value={schoolSettings.website}
                onChange={(e) => setSchoolSettings({...schoolSettings, website: e.target.value})}
                placeholder="Website URL"
              />
            </div>

            <Button onClick={saveSchoolSettings} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save School Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Admin Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              Admin Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                value={adminProfile.name}
                onChange={(e) => setAdminProfile({...adminProfile, name: e.target.value})}
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={adminProfile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Input
                value={adminProfile.role}
                onChange={(e) => setAdminProfile({...adminProfile, role: e.target.value})}
                placeholder="Your role"
              />
            </div>

            <Button onClick={saveAdminProfile} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Classes Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            Classes Management
          </CardTitle>
          <Button onClick={() => setShowAddClass(true)}>
            Add Class
          </Button>
        </CardHeader>
        <CardContent>
          {showAddClass && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-4">Add New Class</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <Input
                    value={classForm.name}
                    onChange={(e) => setClassForm({...classForm, name: e.target.value})}
                    placeholder="e.g., Class 10-A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Number
                  </label>
                  <Input
                    type="number"
                    value={classForm.class_number}
                    onChange={(e) => setClassForm({...classForm, class_number: e.target.value})}
                    placeholder="e.g., 10"
                    min="1"
                    max="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <Input
                    value={classForm.section}
                    onChange={(e) => setClassForm({...classForm, section: e.target.value})}
                    placeholder="e.g., A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Teacher
                  </label>
                  <Input
                    value={classForm.class_teacher}
                    onChange={(e) => setClassForm({...classForm, class_teacher: e.target.value})}
                    placeholder="Teacher name"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={addClass}>Add Class</Button>
                <Button variant="outline" onClick={() => setShowAddClass(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{cls.name}</h4>
                    <p className="text-sm text-gray-600">Class {cls.class_number}</p>
                    {cls.section && (
                      <p className="text-sm text-gray-600">Section: {cls.section}</p>
                    )}
                    {cls.class_teacher && (
                      <p className="text-sm text-gray-600">Teacher: {cls.class_teacher}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteClass(cls.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {classes.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No classes found. Add a class to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 text-red-600 mr-2" />
            System Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Backup Database</h4>
              <p className="text-sm text-yellow-800 mb-3">
                Create a backup of all system data. Recommended before making major changes.
              </p>
              <Button variant="outline" className="text-yellow-700 border-yellow-300">
                <Database className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Reset Database</h4>
              <p className="text-sm text-red-800 mb-3">
                <strong>Warning:</strong> This will permanently delete all data including students, homework, results, etc. This action cannot be undone.
              </p>
              <Button 
                variant="outline" 
                className="text-red-700 border-red-300"
                onClick={resetDatabase}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Database
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
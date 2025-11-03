import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { BookOpen, Plus, Search, CreditCard as Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'
import type { Book, BorrowRequest, Student } from '../../lib/supabase'

export default function LibraryManagement() {
  const [books, setBooks] = useState<Book[]>([])
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([])
  const [activeTab, setActiveTab] = useState<'books' | 'requests'>('books')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    subject: '',
    isbn: '',
    total_copies: '1',
    description: ''
  })

  useEffect(() => {
    loadBooks()
    loadBorrowRequests()
  }, [])

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title', { ascending: true })

      if (data && !error) {
        setBooks(data)
      }
    } catch (error) {
      console.error('Error loading books:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBorrowRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('borrow_requests')
        .select(`
          *,
          book:books(*),
          student:students(*)
        `)
        .order('request_date', { ascending: false })

      if (data && !error) {
        setBorrowRequests(data)
      }
    } catch (error) {
      console.error('Error loading borrow requests:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        subject: formData.subject,
        isbn: formData.isbn,
        total_copies: parseInt(formData.total_copies),
        available_copies: editingBook ? editingBook.available_copies : parseInt(formData.total_copies),
        description: formData.description
      }

      if (editingBook) {
        // Update existing book
        // Preserve available_copies when updating
        const availableDiff = parseInt(formData.total_copies) - editingBook.total_copies
        bookData.available_copies = Math.max(0, editingBook.available_copies + availableDiff)
        
        const { error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', editingBook.id)

        if (!error) {
          alert('Book updated successfully!')
          resetForm()
          loadBooks()
        }
      } else {
        // Add new book
        const { error } = await supabase
          .from('books')
          .insert(bookData)

        if (!error) {
          alert('Book added successfully!')
          resetForm()
          loadBooks()
        }
      }
    } catch (error) {
      console.error('Error saving book:', error)
      alert('Error saving book: ' + (error as any).message)
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      subject: book.subject || '',
      isbn: book.isbn || '',
      total_copies: book.total_copies.toString(),
      description: book.description || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)

      if (!error) {
        alert('Book deleted successfully!')
        loadBooks()
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Error deleting book')
    }
  }

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const updateData: any = { status: action === 'approve' ? 'approved' : 'rejected' }
      
      if (action === 'approve') {
        updateData.issue_date = new Date().toISOString()
        updateData.return_date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
      }

      const { error } = await supabase
        .from('borrow_requests')
        .update(updateData)
        .eq('id', requestId)

      if (!error) {
        alert(`Request ${action}d successfully!`)
        loadBorrowRequests()
        if (action === 'approve') {
          // Update book available copies
          const request = borrowRequests.find(r => r.id === requestId)
          if (request) {
            await supabase
              .from('books')
              .update({ 
                available_copies: request.book!.available_copies - 1 
              })
              .eq('id', request.book_id)
            loadBooks()
          }
        }
      }
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Error updating request')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      subject: '',
      isbn: '',
      total_copies: '1',
      description: ''
    })
    setEditingBook(null)
    setShowAddForm(false)
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingRequests = borrowRequests.filter(req => req.status === 'pending')

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
          <h1 className="text-2xl font-bold text-gray-900">Library Management</h1>
          <p className="text-gray-600">Manage books and borrow requests</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'books'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('books')}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Books ({books.length})
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('requests')}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Requests ({pendingRequests.length})
        </button>
      </div>

      {/* Books Tab */}
      {activeTab === 'books' && (
        <>
          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Search books by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Total: {filteredBooks.length} books
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingBook ? 'Edit Book' : 'Add New Book'}
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
                        placeholder="Book title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author
                      </label>
                      <Input
                        value={formData.author}
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                        placeholder="Author name"
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
                        placeholder="Subject/Category"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ISBN
                      </label>
                      <Input
                        value={formData.isbn}
                        onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                        placeholder="ISBN number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Copies
                      </label>
                      <Input
                        type="number"
                        value={formData.total_copies}
                        onChange={(e) => setFormData({...formData, total_copies: e.target.value})}
                        placeholder="Number of copies"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md resize-none h-20"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Book description"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingBook ? 'Update Book' : 'Add Book'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Books List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                Books Catalog ({filteredBooks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Author</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Copies</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Available</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book) => (
                      <tr key={book.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{book.title}</td>
                        <td className="py-3 px-4">{book.author}</td>
                        <td className="py-3 px-4">{book.subject}</td>
                        <td className="py-3 px-4">{book.total_copies}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            book.available_copies > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {book.available_copies}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(book)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(book.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredBooks.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No books found matching your search.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              Borrow Requests ({borrowRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {borrowRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {request.book?.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        by {request.book?.author}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Student: {request.student?.name}</span>
                        <span>ID: {request.student?.student_id}</span>
                        <span>Requested: {new Date(request.request_date).toLocaleDateString()}</span>
                      </div>
                      
                      {request.status === 'approved' && request.return_date && (
                        <p className="text-sm text-green-600 mt-2">
                          Return by: {new Date(request.return_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4 flex items-center gap-2">
                      {request.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleRequestAction(request.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestAction(request.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {borrowRequests.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No borrow requests found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
"use client";

import { useState, useEffect } from 'react';
import { useAuth, ProtectedRoute } from '@/components/auth/AuthProvider';
import { notesAPI, type Note } from '@/lib/auth';
import Button from '@/components/ui/Button';

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const userNotes = await notesAPI.getNotes();
      setNotes(userNotes);
  } catch (err) {
    setError(err instanceof Error ? err.message : String(err));
    
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      const createdNote = await notesAPI.createNote(newNote);
      setNotes([createdNote, ...notes]);
      setNewNote({ title: '', content: '' });
      setShowForm(false);
      setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await notesAPI.deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
  } catch (err) {
    setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
                <p className="text-gray-600">Welcome back, {user?.username}!</p>
              </div>
              <Button 
                onClick={() => setShowForm(!showForm)}
                variant="primary"
              >
                {showForm ? 'Cancel' : 'Add New Note'}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* New Note Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Create New Note</h2>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter note title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your note here..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="primary">
                    Create Note
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 text-lg">No notes yet</p>
                <p className="text-gray-400 mt-2">Create your first note to get started!</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {note.title}
                      </h3>
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(note.created_at).toLocaleDateString()} by {note.author_name}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleDeleteNote(note.id)}
                      variant="secondary"
                      className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* User Profile Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Username:</span> {user?.username}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user?.email}
              </div>
              {user?.first_name && (
                <div>
                  <span className="font-medium">Name:</span> {user?.first_name} {user?.last_name}
                </div>
              )}
              {user?.organization && (
                <div>
                  <span className="font-medium">Organization:</span> {user?.organization}
                </div>
              )}
              {user?.job_title && (
                <div>
                  <span className="font-medium">Job Title:</span> {user?.job_title}
                </div>
              )}
              <div>
                <span className="font-medium">Member since:</span> {new Date(user?.date_joined || '').toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
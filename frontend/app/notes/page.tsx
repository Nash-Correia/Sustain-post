// app/notes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth, ProtectedRoute } from "@/components/auth/AuthProvider";
import { notesAPI, type Note } from "@/lib/auth";
import Button from "@/components/ui/Button";

/** Extend Note with optional fields your UI reads but the base type may not declare */
type NoteWithExtras = Note & {
  created_at?: string;
  author_name?: string;
};

/** Some backends wrap arrays under these keys */
type ArrayWrappers<T> = {
  results?: T[];
  data?: T[];
  items?: T[];
};

/** Optional fields you read from `user` in the profile card */
type MaybeOrgUser = {
  organization?: string;
  job_title?: string;
  date_joined?: string;
};

/* ----------------------- type guards & helpers ----------------------- */

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isNote(x: unknown): x is NoteWithExtras {
  return isRecord(x) && typeof x.id === "number";
}

function isNoteArray(x: unknown): x is NoteWithExtras[] {
  return Array.isArray(x) && x.every(isNote);
}

function extractWrappedArray<T>(
  payload: unknown,
  isTArray: (u: unknown) => u is T[],
): T[] | null {
  if (!isRecord(payload)) return null;
  const r = (payload as ArrayWrappers<T>).results;
  if (r && isTArray(r)) return r;
  const d = (payload as ArrayWrappers<T>).data;
  if (d && isTArray(d)) return d;
  const i = (payload as ArrayWrappers<T>).items;
  if (i && isTArray(i)) return i;
  return null;
}

/** Normalize unknown payload into Note[] safely (no `any`) */
function normalizeNotes(payload: unknown): NoteWithExtras[] {
  if (isNoteArray(payload)) return payload;

  const wrapped = extractWrappedArray<NoteWithExtras>(payload, isNoteArray);
  if (wrapped) return wrapped;

  if (isNote(payload)) return [payload];

  // last resort: unknown shape
  // (consider logging if you have a logger; console is fine for now)
  console.warn("[Notes] Unexpected API shape from getNotes()", payload);
  return [];
}

/** Try to read a single Note from an unknown payload (no `any`) */
function tryGetSingleNote(payload: unknown): NoteWithExtras | null {
  if (isNote(payload)) return payload;
  const arr = normalizeNotes(payload);
  if (arr.length === 1) return arr[0];
  return null;
}

/** Safe field accessors for user optional fields without `any` */
function getUserField<T extends keyof MaybeOrgUser>(
  user: unknown,
  key: T,
): MaybeOrgUser[T] | undefined {
  if (isRecord(user) && key in user) {
    const v = user[key];
    return (typeof v === "string" ? v : undefined) as MaybeOrgUser[T];
  }
  return undefined;
}

/* -------------------------------------------------------------------- */

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  useEffect(() => {
    void loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotes = async () => {
    try {
      setError(null);
      setLoading(true);
      const payload = await notesAPI.getNotes(); // unknown shape
      setNotes(normalizeNotes(payload));
    } catch (err) {
      console.error("[Notes] loadNotes error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setError(null);
      const payload = await notesAPI.createNote(newNote);

      // Prefer a single created note, else try to normalize/replace,
      // else fall back to refetch (covers odd server responses)
      const created = tryGetSingleNote(payload);
      if (created) {
        setNotes((prev) => [created, ...prev]);
      } else {
        const maybeList = normalizeNotes(payload);
        if (maybeList.length > 0) {
          setNotes(maybeList);
        } else {
          await loadNotes();
        }
      }

      setNewNote({ title: "", content: "" });
      setShowForm(false);
    } catch (err) {
      console.error("[Notes] createNote error:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      setError(null);
      await notesAPI.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("[Notes] deleteNote error:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // optional user fields without `any`
  const org = getUserField(user, "organization");
  const job = getUserField(user, "job_title");
  const joined = getUserField(user, "date_joined");

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
              <Button onClick={() => setShowForm((v) => !v)} variant="primary">
                {showForm ? "Cancel" : "Add New Note"}
              </Button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Form */}
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
                    onChange={(e) =>
                      setNewNote({ ...newNote, title: e.target.value })
                    }
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
                    onChange={(e) =>
                      setNewNote({ ...newNote, content: e.target.value })
                    }
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

          {/* Notes */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-2 text-gray-600">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 text-lg">No notes yet</p>
                <p className="text-gray-400 mt-2">
                  Create your first note to get started!
                </p>
              </div>
            ) : (
              notes.map((note) => {
                const created = note.created_at
                  ? new Date(note.created_at).toLocaleDateString()
                  : "-";
                const author = note.author_name ?? "-";
                return (
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
                          Created: {created} by {author}
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
                );
              })
            )}
          </div>

          {/* Profile Summary */}
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
                  <span className="font-medium">Name:</span>{" "}
                  {user?.first_name} {user?.last_name}
                </div>
              )}
              {org && (
                <div>
                  <span className="font-medium">Organization:</span> {org}
                </div>
              )}
              {job && (
                <div>
                  <span className="font-medium">Job Title:</span> {job}
                </div>
              )}
              <div>
                <span className="font-medium">Member since:</span>{" "}
                {joined ? new Date(joined).toLocaleDateString() : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

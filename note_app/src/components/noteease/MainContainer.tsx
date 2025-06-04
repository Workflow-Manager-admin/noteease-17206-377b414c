import { component$, useSignal, useStore, $ } from "@builder.io/qwik";

/**
 * Note object type.
 */
type Note = {
  id: number;
  title: string;
  content: string;
  category?: string;
};

/**
 * Simple list of sample categories.
 */
const CATEGORY_PRESETS = [
  "Work",
  "Personal",
  "Ideas",
  "Archive"
];

// PUBLIC_INTERFACE
/**
 * MainContainer - The primary container for NoteEase app.
 * Handles sidebar, top bar, note list, note CRUD, search, and categorization.
 */
export const MainContainer = component$(() => {
  // Signal for the search query.
  const searchQuery = useSignal("");
  // Signal to show create/edit note modal.
  const showEditor = useSignal(false);
  // Local state: note list and selected note.
  const notes = useStore<{data: Note[]}>({
    data: [
      // Example starter note
      {
        id: 1,
        title: "Welcome to NoteEase",
        content: "Start by creating your notes.\nThis is a demo note!",
        category: "Personal"
      }
    ]
  });
  const selectedNoteId = useSignal<number | null>(1);
  // Editor state
  const editorNote = useStore<Partial<Note>>({});

  // Derived filtered note list
  const filteredNotes = () =>
    notes.data.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  // (removed unused: getSelectedNote)

  // PUBLIC_INTERFACE
  /**
   * Selects a note by id.
   */
  const selectNote = $((id: number) => {
    selectedNoteId.value = id;
    showEditor.value = false;
  });

  // PUBLIC_INTERFACE
  /**
   * Opens modal to create a new note.
   */
  const createNote = $(() => {
    editorNote.id = undefined;
    editorNote.title = "";
    editorNote.content = "";
    editorNote.category = "";
    showEditor.value = true;
  });

  // PUBLIC_INTERFACE
  /**
   * Opens editor to edit an existing note.
   */
  const editNote = $((note: Note) => {
    Object.assign(editorNote, note);
    showEditor.value = true;
  });

  // PUBLIC_INTERFACE
  /**
   * Save changes from the create/edit modal.
   */
  const saveNote = $(() => {
    if (!editorNote.title || !editorNote.content) {
      alert("Title and content are required.");
      return;
    }
    if (editorNote.id == null) {
      // Create new
      const newId = (Math.max(0, ...notes.data.map(n => n.id)) + 1);
      notes.data.unshift({
        ...(editorNote as Note),
        id: newId
      });
      selectedNoteId.value = newId;
    } else {
      // Edit
      const idx = notes.data.findIndex(n => n.id === editorNote.id);
      if (idx !== -1) {
        notes.data[idx] = {
          ...(editorNote as Note),
          id: editorNote.id!
        };
        selectedNoteId.value = editorNote.id!;
      }
    }
    showEditor.value = false;
  });

  // PUBLIC_INTERFACE
  /**
   * Deletes a note by id.
   */
  const deleteNote = $((id: number) => {
    if (confirm("Delete this note?")) {
      notes.data = notes.data.filter(n => n.id !== id);
      if (selectedNoteId.value === id) {
        selectedNoteId.value = notes.data[0]?.id ?? null;
      }
      showEditor.value = false;
    }
  });

  // PUBLIC_INTERFACE
  /**
   * Updates a note's category/tag.
   */
  const updateCategory = $((id: number, category: string) => {
    const note = notes.data.find(n => n.id === id);
    if (note) {
      note.category = category;
    }
  });

  // Layout & main rendering
  return (
    <div style={{
        display: "flex",
        height: "80vh",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 2px 12px 0 #d6e1f5",
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif"
      }}>
      {/* Sidebar */}
      <aside style={{
          width: "280px",
          background: "#F5F7FA",
          borderRight: "1px solid #e2e8f0",
          padding: "0",
          display: "flex",
          flexDirection: "column"
        }}>
        <div style={{
          padding: "20px 16px 12px",
          fontWeight: "bold",
          fontSize: "1.25rem",
          color: "#4A90E2",
          borderBottom: "1px solid #e2e8f0"
        }}>
          NoteEase
        </div>
        {/* Search Bar */}
        <div style={{padding: "1rem"}}>
          <input
            type="search"
            placeholder="Search notes..."
            value={searchQuery.value}
            onInput$={e => searchQuery.value = (e.target as HTMLInputElement).value}
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid #b0bed9",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              marginBottom: "10px",
              fontSize: "1rem",
              background: "#fff",
              outline: "none"
            }}
          />
          <button
            style={{
              width: "100%",
              background: "#4A90E2",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: "0.65rem 0",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer"
            }}
            onClick$={createNote}
          >+ New note</button>
        </div>
        {/* Note List */}
        <div style={{flex: 1, overflowY: "auto", padding: "0 0.25rem"}}>
          <ul style={{listStyle: "none", padding: 0, margin: 0}}>
            {filteredNotes().map(note =>
              <li
                key={note.id}
                style={{
                  background: note.id === selectedNoteId.value ? "#eaf3fd" : "transparent",
                  margin: "0.5rem 0 0 0",
                  borderRadius: "8px",
                  transition: "background 0.2s",
                  cursor: "pointer"
                }}
                onClick$={() => selectNote(note.id)}
              >
                <div style={{padding: "0.8rem 1rem 0.3rem", borderBottom: "1px solid #ebebeb", fontWeight: 600, fontSize: "1.03rem", color: "#273951"}}>
                  {note.title}
                </div>
                <div style={{padding: "0 1rem 0.7rem", fontSize: "0.9rem", color: "#888"}}>
                  {note.content.slice(0, 60)}
                  {note.content.length > 60 ? "..." : ""}
                </div>
                <div style={{padding: "0 1rem 0.7rem"}}>
                  {note.category && (
                    <span style={{
                      background: "#FFD700",
                      color: "#273951",
                      padding: "2px 10px",
                      borderRadius: "15px",
                      fontSize: "0.78rem",
                      fontWeight: 500
                    }}>{note.category}</span>
                  )}
                </div>
              </li>
            )}
            {filteredNotes().length === 0 &&
              <li style={{padding: "1rem", color: "#aaa"}}>No notes found</li>
            }
          </ul>
        </div>
      </aside>
      {/* Note Content Area */}
      <main style={{flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#fff"}}>
        {/* TopBar */}
        <div style={{padding: "1.15rem 2rem", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F5F7FA"}}>
          <div>
            <span style={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "#222"
            }}>
              {(notes.data.find((n) => n.id === selectedNoteId.value)?.title) ?? "No note selected"}
            </span>
            {notes.data.find((n) => n.id === selectedNoteId.value)?.category && (
              <span style={{
                marginLeft: "12px",
                fontSize: "0.9rem",
                color: "#FFD700",
                background: "#FFF6CF",
                padding: "2px 12px",
                borderRadius: "14px"
              }}>
                {notes.data.find((n) => n.id === selectedNoteId.value)?.category}
              </span>
            )}
          </div>
          <div>
            {(notes.data.find((n) => n.id === selectedNoteId.value)) && (
              <>
                <button
                  style={{
                    background: "#4A90E2",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 18px",
                    marginRight: "8px",
                    fontWeight: 500,
                    fontSize: "1rem",
                    cursor: "pointer"
                  }}
                  onClick$={() => {
                    const note = notes.data.find((n) => n.id === selectedNoteId.value);
                    if (note) editNote(note);
                  }}
                >Edit</button>
                <button
                  style={{
                    background: "#e34c4c",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 18px",
                    fontWeight: 500,
                    fontSize: "1rem",
                    cursor: "pointer"
                  }}
                  onClick$={() => {
                    const note = notes.data.find((n) => n.id === selectedNoteId.value);
                    if (note) deleteNote(note.id);
                  }}
                >Delete</button>
              </>
            )}
          </div>
        </div>
        {/* Note View/Edit */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "2.2rem 2rem", color: "#273951", background: "#fff"
        }}>
          {(notes.data.find((n) => n.id === selectedNoteId.value)) ? (
            <>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {notes.data.find((n) => n.id === selectedNoteId.value)?.content}
              </div>
              <div style={{marginTop: "2rem"}}>
                <label html-for="category-select" style={{marginRight: "1rem", fontSize: "1rem", color: "#888"}}>Category:</label>
                <select
                  id="category-select"
                  value={notes.data.find((n) => n.id === selectedNoteId.value)?.category}
                  style={{
                    fontSize: "1rem",
                    padding: "6px 13px",
                    borderRadius: "7px",
                    border: "1px solid #b0bed9",
                    backgroundColor: "#F5F7FA",
                    color: "#273951"
                  }}
                  onChange$={e => {
                    const note = notes.data.find((n) => n.id === selectedNoteId.value);
                    if (note) updateCategory(note.id, (e.target as HTMLSelectElement).value);
                  }}
                >
                  <option value="">Uncategorized</option>
                  {CATEGORY_PRESETS.map(cat => (
                    <option value={cat} key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div style={{color: "#aaa", fontStyle: "italic"}}>Select or create a note to get started.</div>
          )}
        </div>
      </main>

      {/* Note Editor Modal */}
      {showEditor.value && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(20,30,48,0.23)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onClick$={() => (showEditor.value = false)}
        >
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 2px 18px #b1b8dd99",
            width: "90vw",
            maxWidth: "430px",
            minHeight: "310px",
            padding: "2rem 2rem",
            position: "relative"
          }}
          onClick$={e => e.stopPropagation()}
          >
            <h2 style={{marginTop: 0, marginBottom: "1.2rem"}}>
              {editorNote.id == null ? "Create Note" : "Edit Note"}
            </h2>
            <div style={{marginBottom: "0.9rem"}}>
              <input
                type="text"
                placeholder="Note title"
                value={editorNote.title}
                autoFocus
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #b0bed9",
                  borderRadius: "7px",
                  fontSize: "1.08rem",
                  marginBottom: "10px"
                }}
                onInput$={e => (editorNote.title = (e.target as HTMLInputElement).value)}
              />
              <textarea
                placeholder="Note content"
                value={editorNote.content}
                rows={8}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #b0bed9",
                  borderRadius: "7px",
                  fontSize: "1rem",
                  resize: "vertical",
                  minHeight: "90px"
                }}
                onInput$={e => (editorNote.content = (e.target as HTMLTextAreaElement).value)}
              />
            </div>
            <div style={{marginBottom: "1.2rem"}}>
              <select
                value={editorNote.category || ""}
                style={{
                  padding: "7px 12px",
                  borderRadius: "7px",
                  border: "1px solid #b0bed9",
                  fontSize: "1rem",
                  backgroundColor: "#F5F7FA",
                  color: "#273951"
                }}
                onChange$={e => (editorNote.category = (e.target as HTMLSelectElement).value)}
              >
                <option value="">Uncategorized</option>
                {CATEGORY_PRESETS.map(cat => (
                  <option value={cat} key={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div style={{display: "flex", justifyContent: "flex-end", gap: "12px"}}>
              <button
                style={{
                  background: "#b0bed9",
                  color: "#273951",
                  border: "none",
                  borderRadius: "7px",
                  padding: "8px 21px",
                  fontWeight: 500,
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
                onClick$={() => (showEditor.value = false)}
              >Cancel</button>
              <button
                style={{
                  background: "#4A90E2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "7px",
                  padding: "8px 21px",
                  fontWeight: 500,
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
                onClick$={saveNote}
              >Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

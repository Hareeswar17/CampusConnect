import {
  BookOpen,
  Download,
  Eye,
  FileText,
  Folder,
  Trash2,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatRelativeTime } from "../utils/time";

const CATEGORY_ICONS = {
  "Lecture Slides": { icon: Folder, bg: "bg-blue-50", color: "text-blue-600", badge: "bg-blue-50 text-blue-700 border border-blue-100" },
  "Reading Materials": { icon: BookOpen, bg: "bg-emerald-50", color: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
  "Key Documents": { icon: FileText, bg: "bg-amber-50", color: "text-amber-600", badge: "bg-amber-50 text-amber-700 border border-amber-100" },
};

function GroupResourcesPage() {
  const { groupId } = useParams();
  const { authUser } = useAuthStore();
  const { groupById, resourcesByGroup, fetchGroup, fetchResources, createResource, deleteResource } = useGroupStore();
  const group = groupById[groupId] || {};
  const isTeacher = authUser?.role === "teacher" || group?.isTeacher || (group?.teachers && group.teachers.includes(authUser?._id));

  const [activeCategory, setActiveCategory] = useState("Lecture Slides");
  const [showForm, setShowForm] = useState(false);
  const [showSyllabusForm, setShowSyllabusForm] = useState(false);

  const [formCategory, setFormCategory] = useState("Lecture Slides");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [fileData, setFileData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [type, setType] = useState("LINK");

  const handleFileChange = (e, setFileState) => {
    const file = e.target.files[0];
    if (!file) {
      setFileState(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileState(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchGroup(groupId);
    fetchResources(groupId);
  }, [fetchGroup, fetchResources, groupId]);

  const resources = resourcesByGroup[groupId] || [];

  const syllabusResource = useMemo(() => {
    return resources.find(r => r.category === "Syllabus");
  }, [resources]);

  const categoryCounts = useMemo(() => {
    const counts = { "Lecture Slides": 0, "Reading Materials": 0, "Key Documents": 0 };
    resources.forEach(r => {
      if (counts[r.category] !== undefined) counts[r.category]++;
    });
    return counts;
  }, [resources]);

  const activeFiles = useMemo(() => {
    return resources.filter(r => r.category === activeCategory);
  }, [resources, activeCategory]);

  const recentFiles = useMemo(() => {
    return resources.filter(r => r.category !== "Syllabus").slice(0, 5);
  }, [resources]);

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Please provide a title");
    if (type === "LINK" && !url.trim()) return toast.error("Please provide a valid URL");
    if (type !== "LINK" && !fileData && !url.trim()) return toast.error("Please select a file to upload or provide a link");
    
    setIsUploading(true);
    const success = await createResource(groupId, {
      title,
      url: type === "LINK" ? url : "",
      fileData: type !== "LINK" ? fileData : null,
      category: formCategory,
      type,
    });
    setIsUploading(false);

    if (success) {
      setShowForm(false);
      setTitle("");
      setUrl("");
      setFileData(null);
      setType("LINK");
    }
  };

  const handleSaveSyllabus = async () => {
    if (!fileData && !url.trim()) return toast.error("Please select a PDF to upload or provide a link");
    
    setIsUploading(true);
    if (syllabusResource) {
      await deleteResource(groupId, syllabusResource._id);
    }
    const success = await createResource(groupId, {
      title: "Course Syllabus",
      url: !fileData ? url : "",
      fileData: fileData || null,
      category: "Syllabus",
      type: "PDF",
    });
    setIsUploading(false);

    if (success) {
      setShowSyllabusForm(false);
      setUrl("");
      setFileData(null);
    }
  };

  const accentSky = "var(--wa-accent-sky)";
  const accentGray = "var(--wa-accent-gray)";

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl">
          <div className="text-xs text-[var(--wa-text-secondary)]">
            Groups / {group.title || "Group"}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                Class Resources
              </h2>
              <p className="text-sm text-[var(--wa-text-secondary)]">
                Access all your study materials, lecture slides, and key documents.
              </p>
            </div>
            {isTeacher && !showForm && (
              <button
                onClick={() => {
                  setFormCategory(activeCategory);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="w-4 h-4" /> Add Resource
              </button>
            )}
          </div>

          {isTeacher && showForm && (
            <div className="mt-4 rounded-2xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 animate-in slide-in-from-top-4 fade-in">
              <div className="flex items-center justify-between border-b border-[var(--wa-panel-border)] pb-3">
                <div className="text-sm font-semibold text-[var(--wa-text-primary)]">Add New Resource</div>
                <button onClick={() => setShowForm(false)} className="text-[var(--wa-text-secondary)] hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                  >
                    <option value="Lecture Slides">Lecture Slides</option>
                    <option value="Reading Materials">Reading Materials</option>
                    <option value="Key Documents">Key Documents</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">File Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                  >
                    <option value="LINK">External Link</option>
                    <option value="PDF">PDF Document</option>
                    <option value="PPTX">PowerPoint (PPTX)</option>
                    <option value="DOCX">Word (DOCX)</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">Title <span className="text-red-500">*</span></label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Week 1 Slides"
                    className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                    {type === "LINK" ? "URL / Link" : "Upload File"} <span className="text-red-500">*</span>
                  </label>
                  {type === "LINK" ? (
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                    />
                  ) : (
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, setFileData)}
                      className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-1.5 text-sm text-[var(--wa-text-primary)] outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--wa-panel-hover)] file:text-[var(--wa-text-primary)] hover:file:bg-[var(--wa-panel-border)] cursor-pointer"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--wa-panel-border)]">
                <button disabled={isUploading} onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] disabled:opacity-50">Cancel</button>
                <button disabled={isUploading} onClick={handleSave} className="inline-flex items-center gap-2 rounded-lg bg-[var(--wa-green)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--wa-green-deep)] disabled:opacity-70">
                  {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUploading ? "Uploading..." : "Save Resource"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {Object.keys(CATEGORY_ICONS).map((catTitle) => {
                  const style = CATEGORY_ICONS[catTitle];
                  const Icon = style.icon;
                  const isActive = activeCategory === catTitle;
                  const count = categoryCounts[catTitle] || 0;
                  return (
                    <button
                      key={catTitle}
                      type="button"
                      onClick={() => setActiveCategory(catTitle)}
                      className={[
                        "rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4 text-left transition-colors focus:outline-none focus-visible:outline-none",
                        isActive ? "bg-[var(--wa-panel-hover)] shadow-sm" : "hover:bg-[var(--wa-panel-hover)]",
                      ].join(" ")}
                      style={{ borderLeftColor: isActive ? accentSky : accentGray }}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.bg}`}>
                          <Icon className={`w-5 h-5 ${style.color}`} />
                        </div>
                      </div>
                      <div className="mt-4 text-sm font-semibold text-[var(--wa-text-primary)]">
                        {catTitle}
                      </div>
                      <div className="mt-1 text-xs text-[var(--wa-text-secondary)]">
                        {count} item{count !== 1 && 's'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)]"
                style={{ borderLeftColor: accentSky }}
              >
                <div className="flex items-center justify-between border-b border-[var(--wa-panel-border)] px-4 py-3">
                  <div className="text-sm font-semibold text-[var(--wa-text-primary)]">
                    {activeCategory}
                  </div>
                </div>
                <div className="divide-y divide-[var(--wa-panel-border)]">
                  {activeFiles.map((file) => {
                    const style = CATEGORY_ICONS[file.category];
                    const Icon = style.icon;
                    return (
                      <div key={file._id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--wa-panel-hover)] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.bg}`}>
                            <Icon className={`w-5 h-5 ${style.color}`} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[var(--wa-text-primary)]">
                              {file.title}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
                                {file.type || "LINK"}
                              </span>
                              <span>Added {formatRelativeTime(file.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Open / Download"
                            className="w-8 h-8 rounded-full border border-[var(--wa-panel-border)] flex items-center justify-center text-[var(--wa-text-secondary)] hover:text-[var(--wa-green)] hover:border-[var(--wa-green)] transition-colors"
                          >
                            {file.type === "LINK" ? <Eye className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                          </a>
                          {isTeacher && (
                            <button
                              onClick={() => deleteResource(groupId, file._id)}
                              title="Delete Resource"
                              className="w-8 h-8 rounded-full border border-[var(--wa-panel-border)] flex items-center justify-center text-[var(--wa-text-secondary)] hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {activeFiles.length === 0 && (
                    <div className="p-8 text-center text-sm text-[var(--wa-text-secondary)]">
                      No resources found in this category.
                    </div>
                  )}
                </div>
              </div>

              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)]"
                style={{ borderLeftColor: accentGray }}
              >
                <div className="flex items-center justify-between border-b border-[var(--wa-panel-border)] px-4 py-3">
                  <div className="text-sm font-semibold text-[var(--wa-text-primary)]">
                    Recently Added Files
                  </div>
                </div>
                <div className="divide-y divide-[var(--wa-panel-border)]">
                  {recentFiles.map((file) => {
                    const style = CATEGORY_ICONS[file.category];
                    const Icon = style.icon;
                    return (
                      <div key={file._id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--wa-panel-hover)] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.bg}`}>
                            <Icon className={`w-4 h-4 ${style.color}`} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[var(--wa-text-primary)]">
                              {file.title}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--wa-text-secondary)]">
                              <span className={`rounded-full px-1.5 py-0.5 font-semibold ${style.badge}`}>
                                {file.type || "LINK"}
                              </span>
                              <span>{file.category}</span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-7 h-7 rounded-full border border-[var(--wa-panel-border)] flex items-center justify-center text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]"
                        >
                          <Eye className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  })}
                  {recentFiles.length === 0 && (
                    <div className="p-6 text-center text-xs text-[var(--wa-text-secondary)]">
                      No recent activity.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div
                className="relative rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 overflow-hidden"
                style={{ borderLeftColor: accentSky }}
              >
                <div className="absolute right-5 top-4 text-[var(--wa-panel-active)]">
                  <BookOpen className="w-12 h-12" />
                </div>
                <div className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Course Syllabus
                </div>
                <p className="mt-2 text-xs text-[var(--wa-text-secondary)] max-w-[220px]">
                  Essential information about course policies, grading criteria, and schedule.
                </p>
                <div className="mt-4 space-y-2">
                  {syllabusResource ? (
                    <>
                      <a
                        href={syllabusResource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--wa-green)] py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--wa-green-deep)] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Syllabus
                      </a>
                      {isTeacher && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowSyllabusForm(!showSyllabusForm)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--wa-panel-border)] py-1.5 text-xs font-semibold text-[var(--wa-text-primary)] hover:bg-[var(--wa-panel-hover)]"
                          >
                            Modify
                          </button>
                          <button
                            onClick={() => deleteResource(groupId, syllabusResource._id)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-full inline-flex items-center justify-center rounded-lg border border-dashed border-[var(--wa-panel-border)] py-2 text-xs text-[var(--wa-text-secondary)]">
                        No syllabus provided yet.
                      </div>
                      {isTeacher && (
                        <button
                          onClick={() => setShowSyllabusForm(!showSyllabusForm)}
                          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--wa-panel-active)] py-2 text-xs font-semibold text-[var(--wa-text-primary)] hover:bg-[var(--wa-panel-hover)] border border-[var(--wa-panel-border)]"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Syllabus
                        </button>
                      )}
                    </>
                  )}
                </div>

                {isTeacher && showSyllabusForm && (
                  <div className="mt-4 pt-4 border-t border-[var(--wa-panel-border)] animate-in fade-in">
                    <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">Upload Syllabus PDF <span className="text-red-500">*</span></label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, setFileData)}
                      className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-2 py-1 text-xs text-[var(--wa-text-primary)] outline-none file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[var(--wa-panel-hover)] file:text-[var(--wa-text-primary)] hover:file:bg-[var(--wa-panel-border)] cursor-pointer"
                    />
                    <div className="text-[10px] text-[var(--wa-text-secondary)] mt-1 text-center font-medium">OR</div>
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Or provide a link..."
                      className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-2 py-1.5 text-xs text-[var(--wa-text-primary)] outline-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button disabled={isUploading} onClick={() => setShowSyllabusForm(false)} className="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] border border-[var(--wa-panel-border)] disabled:opacity-50">Cancel</button>
                      <button disabled={isUploading} onClick={handleSaveSyllabus} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--wa-green)] px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-70">
                        {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isUploading ? "Uploading..." : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupResourcesPage;

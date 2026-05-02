import { ArrowLeft, Paperclip } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { useGroupStore } from "../store/useGroupStore";

function GroupAskDoubtPage() {
  const { groupId } = useParams();
  const { groupById, fetchGroup, createDoubt } = useGroupStore();
  const group = groupById[groupId] || {};
  const navigate = useNavigate();
  const accentSky = "var(--wa-accent-sky)";
  const accentGray = "var(--wa-accent-gray)";
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [tagTeacher, setTagTeacher] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          name: file.name,
          size: file.size,
          data: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchGroup(groupId);
  }, [fetchGroup, groupId]);

  const handlePost = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle || !trimmedDescription) return;

    const created = await createDoubt(groupId, {
      title: trimmedTitle,
      topic: topic || "General",
      description: trimmedDescription,
      assignedToTeacher: tagTeacher,
      isUrgent,
      attachmentData: attachment?.data || "",
    });

    if (created) {
      navigate(`/groups/${groupId}/doubts`);
    }
  };

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[var(--wa-text-secondary)]">
              Groups / {group.title || "Group"} / {group.isGroupTeacher ? "Publish a Question/Blog" : "Ask a Doubt"}
            </div>
            <Link
              to={`/groups/${groupId}/doubts`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Doubts
            </Link>
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--wa-text-primary)]">
            {group.isGroupTeacher ? "Publish a Question/Blog" : "Ask a Doubt"}
          </h2>
          <p className="text-sm text-[var(--wa-text-secondary)]">
            {group.isGroupTeacher
              ? `Publish a blog or general question to your students in ${group.title || "group"}.`
              : `Post your question to the ${group.title || "group"}. Tutors and peers can help you out.`}
          </p>

          <div
            className="mt-6 rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 space-y-5"
            style={{ borderLeftColor: accentSky }}
          >
            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div>
                <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                  {group.isGroupTeacher ? "Title" : "Question Title"}
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={group.isGroupTeacher ? "e.g. Interesting concepts about integration" : "e.g. How to solve this integration by parts problem?"}
                  className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                  Topic
                </label>
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="e.g. Integration"
                  className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                  Description
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {!group.isGroupTeacher && (
                    <>
                      <label className="flex items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
                        Tag a Teacher
                        <input
                          type="checkbox"
                          checked={tagTeacher}
                          onChange={(event) => setTagTeacher(event.target.checked)}
                          className="accent-[var(--wa-green)]"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
                        Mark as Urgent
                        <input
                          type="checkbox"
                          checked={isUrgent}
                          onChange={(event) => setIsUrgent(event.target.checked)}
                          className="accent-[var(--wa-green)]"
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
              <div
                className="mt-2 rounded-lg border border-l-4 border-[var(--wa-panel-border)]"
                style={{ borderLeftColor: accentGray }}
              >
                <div className="flex items-center gap-3 border-b border-[var(--wa-panel-border)] px-3 py-2 text-xs text-[var(--wa-text-secondary)]">
                  <button type="button" className="font-semibold">
                    B
                  </button>
                  <button type="button" className="italic">
                    I
                  </button>
                  <button type="button" className="underline">
                    U
                  </button>
                  <span className="text-[var(--wa-text-secondary)]">|</span>
                  <button type="button">\</button>
                  <button type="button">=</button>
                </div>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={group.isGroupTeacher ? "Write your blog or question content here..." : "Describe your doubt in detail. Include what you've tried so far..."}
                  className="w-full rounded-b-lg bg-transparent px-3 py-3 text-sm text-[var(--wa-text-primary)] outline-none"
                />
              </div>
              {tagTeacher ? (
                <p className="mt-2 text-xs text-[var(--wa-text-secondary)]">
                  Teacher tagged: only a teacher clarification will mark this as
                  resolved.
                </p>
              ) : null}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                Attachments
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 cursor-pointer rounded-lg border border-l-4 border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel-active)] p-6 text-center hover:bg-[var(--wa-panel-border)]"
                style={{ borderLeftColor: accentGray }}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--wa-green)]">
                  <Paperclip className="w-5 h-5" />
                </div>
                <p className="mt-2 text-sm font-medium text-[var(--wa-text-primary)]">
                  Click to upload
                </p>
                <p className="text-xs text-[var(--wa-text-secondary)]">
                  PNG, JPG, PDF (max. 10MB)
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf"
                />
              </div>

              {attachment && (
                <div
                  className="mt-3 flex items-center justify-between rounded-lg border border-l-4 border-[var(--wa-panel-border)] px-3 py-2 text-xs"
                  style={{ borderLeftColor: accentGray }}
                >
                  <div>
                    <p className="font-semibold text-[var(--wa-text-primary)]">
                      {attachment.name}
                    </p>
                    <p className="text-[var(--wa-text-secondary)]">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-[var(--wa-text-secondary)] hover:text-red-500"
                  >
                    x
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--wa-text-secondary)]"
              >
                Save Draft
              </button>
              <button
                type="button"
                className="rounded-lg bg-[var(--wa-panel-active)] px-4 py-2 text-sm font-semibold text-[var(--wa-text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePost}
                className="rounded-lg bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white"
              >
                {group.isGroupTeacher ? "Publish Post" : "Post Question"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupAskDoubtPage;

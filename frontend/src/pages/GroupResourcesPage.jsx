import {
  BookOpen,
  Download,
  Eye,
  FileText,
  Folder,
  MoreVertical,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { getGroupById } from "../data/groups";

const RESOURCE_CATEGORIES = [
  {
    title: "Lecture Slides",
    count: "24 items",
    updated: "Updated 2d ago",
    icon: Folder,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Reading Materials",
    count: "15 items",
    updated: "Updated 1w ago",
    icon: BookOpen,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Key Documents",
    count: "8 items",
    updated: "Updated 3w ago",
    icon: FileText,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

const RECENT_FILES = [
  {
    id: "file-1",
    name: "Week_4_Cellular_Biology.pdf",
    type: "PDF",
    details: "Uploaded Oct 12 · 2.4 MB",
    icon: FileText,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    badgeClass: "bg-red-50 text-red-700 border border-red-100",
  },
  {
    id: "file-2",
    name: "Ch3_Market_Analysis_Slides.pptx",
    type: "PPTX",
    details: "Uploaded Oct 10 · 5.1 MB",
    icon: FileText,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    badgeClass: "bg-orange-50 text-orange-700 border border-orange-100",
  },
  {
    id: "file-3",
    name: "Assignment_1_Guidelines.docx",
    type: "DOCX",
    details: "Uploaded Oct 8 · 1.2 MB",
    icon: FileText,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    badgeClass: "bg-blue-50 text-blue-700 border border-blue-100",
  },
];

const CATEGORY_FILES = {
  "Lecture Slides": [
    {
      id: "ls-1",
      name: "Week_1_Introduction.pptx",
      type: "PPTX",
      details: "Uploaded Sep 2 · 3.1 MB",
      icon: FileText,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      badgeClass: "bg-orange-50 text-orange-700 border border-orange-100",
    },
    {
      id: "ls-2",
      name: "Week_2_Algorithms.pptx",
      type: "PPTX",
      details: "Uploaded Sep 9 · 4.6 MB",
      icon: FileText,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      badgeClass: "bg-orange-50 text-orange-700 border border-orange-100",
    },
    {
      id: "ls-3",
      name: "Week_3_Data_Structures.pptx",
      type: "PPTX",
      details: "Uploaded Sep 16 · 5.2 MB",
      icon: FileText,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      badgeClass: "bg-orange-50 text-orange-700 border border-orange-100",
    },
  ],
  "Reading Materials": [
    {
      id: "rm-1",
      name: "Chapter_1_Foundations.pdf",
      type: "PDF",
      details: "Uploaded Sep 3 · 2.0 MB",
      icon: BookOpen,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    {
      id: "rm-2",
      name: "Chapter_2_Complexity.pdf",
      type: "PDF",
      details: "Uploaded Sep 10 · 2.4 MB",
      icon: BookOpen,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    {
      id: "rm-3",
      name: "Chapter_3_Graphs.pdf",
      type: "PDF",
      details: "Uploaded Sep 17 · 3.0 MB",
      icon: BookOpen,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
  ],
  "Key Documents": [
    {
      id: "kd-1",
      name: "Assignment_1_Guidelines.docx",
      type: "DOCX",
      details: "Uploaded Sep 5 · 1.2 MB",
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      badgeClass: "bg-blue-50 text-blue-700 border border-blue-100",
    },
    {
      id: "kd-2",
      name: "Project_Rubric.pdf",
      type: "PDF",
      details: "Uploaded Sep 12 · 900 KB",
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      badgeClass: "bg-blue-50 text-blue-700 border border-blue-100",
    },
    {
      id: "kd-3",
      name: "Exam_Policies.pdf",
      type: "PDF",
      details: "Uploaded Sep 18 · 740 KB",
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      badgeClass: "bg-blue-50 text-blue-700 border border-blue-100",
    },
  ],
};

function GroupResourcesPage() {
  const { groupId } = useParams();
  const group = getGroupById(groupId);
  const [activeCategory, setActiveCategory] = useState(
    RESOURCE_CATEGORIES[0]?.title || "Lecture Slides",
  );
  const accentSky = "var(--wa-accent-sky)";
  const accentGray = "var(--wa-accent-gray)";
  const fallbackFiles = CATEGORY_FILES["Lecture Slides"];
  const activeFiles =
    CATEGORY_FILES[activeCategory] && CATEGORY_FILES[activeCategory].length
      ? CATEGORY_FILES[activeCategory]
      : fallbackFiles;

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl">
          <div className="text-xs text-[var(--wa-text-secondary)]">
            Groups / {group.title}
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--wa-text-primary)]">
            Class Resources
          </h2>
          <p className="text-sm text-[var(--wa-text-secondary)]">
            Access all your study materials, lecture slides, and key documents
            for the semester.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {RESOURCE_CATEGORIES.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeCategory === item.title;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setActiveCategory(item.title)}
                      className={[
                        "rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4 text-left transition-colors focus:outline-none focus-visible:outline-none",
                        isActive
                          ? "bg-[var(--wa-panel-hover)]"
                          : "hover:bg-[var(--wa-panel-hover)]",
                      ].join(" ")}
                      style={{
                        borderLeftColor: isActive ? accentSky : accentGray,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.iconBg}`}
                        >
                          <Icon className={`w-5 h-5 ${item.iconColor}`} />
                        </div>
                        <button
                          type="button"
                          aria-label={`${item.title} options`}
                          className="text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)] focus:outline-none focus-visible:outline-none"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MoreVertical className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                      <div className="mt-4 text-sm font-semibold text-[var(--wa-text-primary)]">
                        {item.title}
                      </div>
                      <div className="mt-1 text-xs text-[var(--wa-text-secondary)]">
                        {item.count} · {item.updated}
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
                  <button
                    type="button"
                    className="text-xs font-semibold text-[var(--wa-green)]"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-[var(--wa-panel-border)]">
                  {activeFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${file.iconBg}`}
                        >
                          <file.icon className={`w-5 h-5 ${file.iconColor}`} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--wa-text-primary)]">
                            {file.name}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${file.badgeClass}`}
                            >
                              {file.type}
                            </span>
                            <span>{file.details}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Download ${file.name}`}
                        className="w-9 h-9 rounded-full border border-[var(--wa-panel-border)] flex items-center justify-center text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)]"
                style={{ borderLeftColor: accentGray }}
              >
                <div className="flex items-center justify-between border-b border-[var(--wa-panel-border)] px-4 py-3">
                  <div className="text-sm font-semibold text-[var(--wa-text-primary)]">
                    Recent Files
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[var(--wa-green)]"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-[var(--wa-panel-border)]">
                  {RECENT_FILES.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${file.iconBg}`}
                        >
                          <file.icon className={`w-5 h-5 ${file.iconColor}`} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--wa-text-primary)]">
                            {file.name}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${file.badgeClass}`}
                            >
                              {file.type}
                            </span>
                            <span>{file.details}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Download ${file.name}`}
                        className="w-9 h-9 rounded-full border border-[var(--wa-panel-border)] flex items-center justify-center text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
                  Essential information about course policies, grading criteria,
                  and the weekly schedule for the Fall semester.
                </p>
                <div className="mt-4 space-y-2">
                  <a
                    href="/course-syllabus.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--wa-green)] py-2 text-sm font-semibold text-white"
                  >
                    <Eye className="w-4 h-4" />
                    View Syllabus
                  </a>
                  <a
                    href="/course-syllabus.pdf"
                    download
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--wa-panel-border)] py-2 text-sm font-semibold text-[var(--wa-text-primary)]"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                </div>
              </div>

              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: accentGray }}
              >
                <div className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Resource Storage
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-[var(--wa-panel-active)]">
                  <div className="h-2 w-[45%] rounded-full bg-emerald-500" />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[var(--wa-text-secondary)]">
                  <span>4.5 GB used</span>
                  <span>10 GB total</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupResourcesPage;

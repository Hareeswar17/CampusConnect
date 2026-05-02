export const GROUPS = [
  {
    id: "physics",
    title: "Advanced Physics",
    subtitle: "PHY-301 - Active Term",
    members: "248 Members",
    cover: "linear-gradient(140deg, #0f172a 0%, #1e3a8a 50%, #0b1120 100%)",
  },
  {
    id: "calculus",
    title: "Calculus II",
    subtitle: "MATH-202 - Active Term",
    members: "184 Members",
    cover: "linear-gradient(140deg, #0f172a 0%, #1d4ed8 55%, #1e293b 100%)",
  },
  {
    id: "history",
    title: "World History",
    subtitle: "HIS-110 - Active Term",
    members: "312 Members",
    cover: "linear-gradient(140deg, #1f2937 0%, #0f172a 50%, #111827 100%)",
  },
];

export const SUGGESTED_GROUPS = [
  {
    id: "python",
    title: "Intro to Python",
    members: "45 Members",
    icon: "code",
  },
  {
    id: "biology",
    title: "Biology Study",
    members: "120 Members",
    icon: "leaf",
  },
  {
    id: "design",
    title: "Design Thinking",
    members: "89 Members",
    icon: "pen",
  },
  {
    id: "literature",
    title: "Literature Review",
    members: "34 Members",
    icon: "book",
  },
];

export const getGroupById = (groupId) => {
  return GROUPS.find((group) => group.id === groupId) || GROUPS[0];
};

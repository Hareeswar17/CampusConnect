# Graph Report - CampusConnect  (2026-05-26)

## Corpus Check
- 95 files · ~144,778 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 335 nodes · 716 edges · 29 communities (28 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f72eccbf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 45 edges
2. `useChatStore` - 29 edges
3. `requireGroup()` - 28 edges
4. `useGroupStore` - 27 edges
5. `ENV` - 16 edges
6. `isValidObjectId()` - 13 edges
7. `useThemeStore` - 13 edges
8. `formatGroup()` - 7 edges
9. `protectRoute()` - 7 edges
10. `formatRelativeTime()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `GroupDoubtsPage()` --calls--> `useGroupStore`  [EXTRACTED]
  frontend/src/pages/GroupDoubtsPage.jsx → frontend/src/store/useGroupStore.js
- `App()` --calls--> `useThemeStore`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/store/useThemeStore.js
- `App()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/store/useAuthStore.js
- `ActiveTabSwitch()` --calls--> `useChatStore`  [EXTRACTED]
  frontend/src/components/ActiveTabSwitch.jsx → frontend/src/store/useChatStore.js
- `ChatContainer()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/src/components/ChatContainer.jsx → frontend/src/store/useAuthStore.js

## Communities (29 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (44): addMember(), createDoubt(), createDoubtComment(), createEvent(), createGroup(), createProject(), createResource(), createTask() (+36 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (30): clerkWebhook(), getFullName(), getPrimaryEmail(), aj, connectDB(), ENV, app, io (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (14): ActiveTabSwitch(), ChatContainer(), TARGET_LANGUAGE_OPTIONS, ChatHeader(), ChatsList(), NoChatsFound(), axiosInstance, ChatPage() (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (25): acceptFriendRequest(), clerkClient, DEFAULT_TTS_PROFILE, deleteMessage(), deriveFullNameFromClerkUser(), enrichUserNameFromClerk(), getAllContacts(), getChatPartners() (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (17): applySchemaDefaults(), SKIP_PATHS, up(), Message, messageSchema, __dirname, __filename, getClerkFullName() (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (17): checkAuth(), login(), logout(), setUserRole(), signup(), updateProfile(), arcjetProtection(), clerkClient (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.21
Nodes (9): ClassSideNav(), GroupAskDoubtPage(), GroupChatPage(), GroupClarifyDoubtPage(), CATEGORY_ICONS, GroupResourcesPage(), GroupRosterPage(), GroupTasksPage() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.19
Nodes (11): COMMENT_LABELS, GroupDoubtDetailPage(), TYPE_STYLES, GroupDoubtsPage(), DAY_HEADERS, GroupOverviewPage(), MONTH_NAMES, formatDateTime() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.23
Nodes (7): ProfileHeader(), navItems, SideNavBar(), TopAppBar(), LandingPage(), SettingsPage(), useThemeStore

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (6): ContactList(), RequestsList(), RoleSelectionModal(), GroupProjectsPage(), GroupsPage(), useAuthStore

### Community 10 - "Community 10"
Cohesion: 0.39
Nodes (6): sendTeacherVerificationEmail(), sendWelcomeEmail(), createTeacherVerificationEmailTemplate(), createWelcomeEmailTemplate(), resendClient, sender

### Community 11 - "Community 11"
Cohesion: 0.32
Nodes (4): formatRecordingTime(), MessageInput(), keyStrokeSounds, useKeyboardSound()

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (3): envBaseUrl, setAuthTokenGetter(), App()

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (5): copyDir(), repoRoot, run(), sourceDir, targetDir

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (3): DAY_HEADERS, GroupEventsPage(), MONTH_NAMES

## Knowledge Gaps
- **62 isolated node(s):** `__dirname`, `distPath`, `clerkClient`, `TTS_PROFILE_BY_LANGUAGE`, `DEFAULT_TTS_PROFILE` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ENV` connect `Community 1` to `Community 10`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `Community 9` to `Community 2`, `Community 6`, `Community 7`, `Community 8`, `Community 12`, `Community 15`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `useChatStore` connect `Community 2` to `Community 8`, `Community 9`, `Community 11`, `Community 6`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `__dirname`, `distPath`, `clerkClient` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._

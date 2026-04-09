import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { UsersIcon } from "lucide-react";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (allContacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-full border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900 flex items-center justify-center">
          <UsersIcon className="w-8 h-8 text-brand-500" />
        </div>
        <div>
          <h4 className="text-slate-900 dark:text-slate-100 font-medium mb-1">
            No contacts yet
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm px-6">
            Add friends from the requests tab. Accepted friends appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="rounded-lg border border-slate-200 bg-white p-4 cursor-pointer hover:bg-slate-50 transition-colors duration-150 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}
            >
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} />
              </div>
            </div>
            <h4 className="text-slate-900 dark:text-slate-100 font-medium">
              {contact.fullName}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
}
export default ContactList;

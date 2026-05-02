import mongoose from "mongoose";
import { ENV } from "./src/lib/env.js";
import GroupDoubt from "./src/models/GroupDoubt.js";
import GroupDoubtComment from "./src/models/GroupDoubtComment.js";

async function deleteTeacherDoubts() {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("Connected to MongoDB");
    
    // Find doubts created by teachers
    const teacherDoubts = await GroupDoubt.find({ createdByRole: "teacher" });
    console.log(`Found ${teacherDoubts.length} doubts created by teachers.`);
    
    if (teacherDoubts.length > 0) {
      const doubtIds = teacherDoubts.map(d => d._id);
      
      // Delete associated comments first to avoid orphans
      const deletedComments = await GroupDoubtComment.deleteMany({ doubtId: { $in: doubtIds } });
      console.log(`Deleted ${deletedComments.deletedCount} associated comments.`);
      
      // Delete the doubts
      const deletedDoubts = await GroupDoubt.deleteMany({ _id: { $in: doubtIds } });
      console.log(`Successfully deleted ${deletedDoubts.deletedCount} doubts.`);
    } else {
      console.log("No teacher doubts found to delete.");
    }
  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

deleteTeacherDoubts();

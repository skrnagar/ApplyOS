import sql from "@/app/api/utils/sql";
import { getOrCreateUser } from "@/app/api/utils/getUser";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = user.id;

    const [totalApps] =
      await sql`SELECT COUNT(*)::int as count FROM applications WHERE user_id = ${userId}`;
    const [interviews] =
      await sql`SELECT COUNT(*)::int as count FROM applications WHERE user_id = ${userId} AND status = 'interview'`;
    const [offers] =
      await sql`SELECT COUNT(*)::int as count FROM applications WHERE user_id = ${userId} AND status = 'offer'`;
    const [rejections] =
      await sql`SELECT COUNT(*)::int as count FROM applications WHERE user_id = ${userId} AND status = 'rejected'`;
    const recentApplications =
      await sql`SELECT * FROM applications WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 5`;
    const [unreadMessages] =
      await sql`SELECT COUNT(*)::int as count FROM messages WHERE user_id = ${userId} AND is_read = false AND sender_type = 'assistant'`;
    const upcomingInterviews = await sql`
      SELECT * FROM applications WHERE user_id = ${userId} AND status = 'interview' AND interview_date >= CURRENT_TIMESTAMP
      ORDER BY interview_date ASC LIMIT 3
    `;

    return Response.json({
      stats: {
        totalApplications: totalApps.count,
        interviews: interviews.count,
        offers: offers.count,
        rejections: rejections.count,
        responseRate:
          totalApps.count > 0
            ? Math.round(
                ((interviews.count + offers.count) / totalApps.count) * 100,
              )
            : 0,
      },
      recentApplications,
      unreadMessages: unreadMessages.count,
      upcomingInterviews,
      user,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

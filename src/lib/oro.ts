import { Post } from "@/models/Post";
import { Comment } from "@/models/Comment";
import { IUser } from "@/models/User";
import { computeXp } from "@/lib/nivel";

export async function computeOro(user: IUser): Promise<number> {
  const [postStats, commentCount] = await Promise.all([
    Post.aggregate([
      { $match: { author: user._id } },
      {
        $group: {
          _id: null,
          posts: { $sum: 1 },
          likes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
        },
      },
    ]),
    Comment.countDocuments({ author: user._id }),
  ]);

  const ganado = computeXp({
    posts: postStats[0]?.posts || 0,
    likesReceived: postStats[0]?.likes || 0,
    comments: commentCount,
    badges: (user.badges || []).length,
  });

  return Math.max(0, ganado - (user.oroGastado || 0));
}

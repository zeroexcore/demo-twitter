import { useParams } from "react-router-dom";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { usersApi } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { cn } from "../lib/utils";
import TweetList from "../components/TweetList";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const isOwnProfile = currentUser?.username === username;

  // Fetch user profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["user", username],
    queryFn: () => usersApi.getProfile(username!),
    enabled: !!username,
  });

  // Fetch user tweets
  const {
    data: tweetsData,
    isLoading: isLoadingTweets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["tweets", username],
    queryFn: async ({ pageParam }) => usersApi.getTweets(username!, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!username,
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: () => usersApi.follow(username!, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", username] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => usersApi.unfollow(username!, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", username] });
    },
  });

  const profile = profileData?.user;
  const tweets = tweetsData?.pages.flatMap((page) => page.tweets) ?? [];

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">User not found</h2>
        <p className="mt-2 text-gray-600">
          The user @{username} doesn't exist.
        </p>
      </div>
    );
  }

  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header Banner */}
      <div className="h-32 bg-gradient-to-r from-primary-400 to-primary-600 sm:h-48" />

      {/* Profile Info */}
      <div className="relative px-4 pb-4">
        {/* Avatar */}
        <div className="absolute -top-12 left-4 sm:-top-16">
          <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 sm:h-32 sm:w-32">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-600 sm:text-4xl">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          {isOwnProfile ? (
            <button
              type="button"
              className={cn(
                "rounded-full border border-gray-300 px-4 py-2 font-semibold",
                "hover:bg-gray-50"
              )}
            >
              Edit profile
            </button>
          ) : isAuthenticated ? (
            <button
              type="button"
              onClick={() =>
                followMutation.isPending || unfollowMutation.isPending
                  ? null
                  : followMutation.mutate()
              }
              disabled={followMutation.isPending || unfollowMutation.isPending}
              className={cn(
                "rounded-full px-4 py-2 font-semibold",
                "bg-gray-900 text-white hover:bg-gray-800",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              Follow
            </button>
          ) : null}
        </div>

        {/* Name & Username */}
        <div className="mt-8 sm:mt-12">
          <h1 className="text-xl font-bold text-gray-900">
            {profile.display_name}
          </h1>
          <p className="text-gray-500">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 text-gray-900">{profile.bio}</p>
        )}

        {/* Join Date */}
        <div className="mt-3 flex items-center gap-1 text-gray-500">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Joined {joinedDate}</span>
        </div>

        {/* Stats */}
        <div className="mt-3 flex gap-4 text-sm">
          <span>
            <span className="font-bold text-gray-900">
              {profile.following_count}
            </span>{" "}
            <span className="text-gray-500">Following</span>
          </span>
          <span>
            <span className="font-bold text-gray-900">
              {profile.followers_count}
            </span>{" "}
            <span className="text-gray-500">Followers</span>
          </span>
        </div>
      </div>

      {/* Tweets Tab */}
      <div className="border-t border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              type="button"
              className={cn(
                "flex-1 py-4 text-center font-semibold",
                "border-b-2 border-primary-600 text-primary-600"
              )}
            >
              Tweets
            </button>
          </div>
        </div>

        {/* Tweet List */}
        <TweetList
          tweets={tweets}
          isLoading={isLoadingTweets}
          hasMore={hasNextPage}
          onLoadMore={() => fetchNextPage()}
          isLoadingMore={isFetchingNextPage}
        />
      </div>
    </div>
  );
}

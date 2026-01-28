import { Link } from "react-router-dom";
import { Heart, Repeat2, MessageCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tweetsApi, type Tweet } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { cn, formatDate } from "../lib/utils";

interface TweetCardProps {
  tweet: Tweet;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const { token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () =>
      tweet.liked_by_me
        ? tweetsApi.unlike(tweet.id, token!)
        : tweetsApi.like(tweet.id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });

  const retweetMutation = useMutation({
    mutationFn: () =>
      tweet.retweeted_by_me
        ? tweetsApi.unretweet(tweet.id, token!)
        : tweetsApi.retweet(tweet.id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });

  return (
    <article className="border-b border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link to={`/${tweet.username}`} className="flex-shrink-0">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
            {tweet.avatar_url ? (
              <img
                src={tweet.avatar_url}
                alt={tweet.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-600 font-semibold">
                {tweet.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-1 text-sm">
            <Link
              to={`/${tweet.username}`}
              className="truncate font-semibold text-gray-900 hover:underline"
            >
              {tweet.display_name}
            </Link>
            <Link
              to={`/${tweet.username}`}
              className="truncate text-gray-500 hover:underline"
            >
              @{tweet.username}
            </Link>
            <span className="text-gray-400">·</span>
            <Link
              to={`/tweet/${tweet.id}`}
              className="text-gray-500 hover:underline"
            >
              {formatDate(tweet.created_at)}
            </Link>
          </div>

          {/* Tweet Content */}
          <Link to={`/tweet/${tweet.id}`}>
            <p className="mt-1 whitespace-pre-wrap break-words text-gray-900">
              {tweet.content}
            </p>
          </Link>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-6">
            {/* Reply (placeholder) */}
            <button
              type="button"
              className="flex items-center gap-1 text-gray-500 hover:text-primary-600"
              disabled
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">0</span>
            </button>

            {/* Retweet */}
            <button
              type="button"
              onClick={() => isAuthenticated && retweetMutation.mutate()}
              disabled={!isAuthenticated || retweetMutation.isPending}
              className={cn(
                "flex items-center gap-1 transition-colors",
                tweet.retweeted_by_me
                  ? "text-green-600"
                  : "text-gray-500 hover:text-green-600",
                !isAuthenticated && "cursor-not-allowed opacity-50"
              )}
            >
              <Repeat2 className="h-4 w-4" />
              <span className="text-xs">{tweet.retweet_count}</span>
            </button>

            {/* Like */}
            <button
              type="button"
              onClick={() => isAuthenticated && likeMutation.mutate()}
              disabled={!isAuthenticated || likeMutation.isPending}
              className={cn(
                "flex items-center gap-1 transition-colors",
                tweet.liked_by_me
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500",
                !isAuthenticated && "cursor-not-allowed opacity-50"
              )}
            >
              <Heart
                className={cn("h-4 w-4", tweet.liked_by_me && "fill-current")}
              />
              <span className="text-xs">{tweet.like_count}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

import { type Tweet } from "../lib/api";
import TweetCard from "./TweetCard";

interface TweetListProps {
  tweets: Tweet[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export default function TweetList({
  tweets,
  isLoading,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: TweetListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No tweets yet</p>
      </div>
    );
  }

  return (
    <div>
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}

      {hasMore && onLoadMore && (
        <div className="p-4 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-primary-600 hover:underline disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

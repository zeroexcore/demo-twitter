import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tweetsApi } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { cn } from "../lib/utils";

export default function ComposeTweet() {
  const [content, setContent] = useState("");
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (content: string) => tweetsApi.create(content, token!),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && content.length <= 280) {
      mutation.mutate(content.trim());
    }
  };

  const remainingChars = 280 - content.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-gray-200 bg-white p-4"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-primary-100">
            <div className="flex h-full w-full items-center justify-center text-primary-600 font-semibold">
              {user?.displayName?.charAt(0).toUpperCase() || "?"}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            rows={3}
            className={cn(
              "w-full resize-none border-0 bg-transparent text-lg",
              "placeholder:text-gray-500 focus:outline-none focus:ring-0"
            )}
          />

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm",
                  remainingChars < 0
                    ? "text-red-500"
                    : remainingChars < 20
                      ? "text-yellow-500"
                      : "text-gray-500"
                )}
              >
                {remainingChars}
              </span>
            </div>

            <button
              type="submit"
              disabled={
                !content.trim() ||
                content.length > 280 ||
                mutation.isPending
              }
              className={cn(
                "rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white",
                "hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {mutation.isPending ? "Posting..." : "Tweet"}
            </button>
          </div>
        </div>
      </div>

      {mutation.isError && (
        <p className="mt-2 text-sm text-red-500">
          Failed to post tweet. Please try again.
        </p>
      )}
    </form>
  );
}

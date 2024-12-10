"use client";
import {
  Ghost,
  Loader2,
  MessageSquare,
  Plus,
  Trash,
  FileText,
  Calendar,
} from "lucide-react";
import UploadButton from "./UploadButton";
import { trpc } from "@/app/components/_trpc/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import { getUserSubscriptionPlan } from "../lib/stripe";
import { format } from "date-fns";

interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const Dashboard = ({ subscriptionPlan }: PageProps) => {
  const [currentDeletingFile, setCurrentDeletingFile] = useState<string | null>(
    null
  );
  const utils = trpc.useContext();
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate();
    },
    onMutate({ id }) {
      setCurrentDeletingFile(id);
    },
    onSettled() {
      setCurrentDeletingFile(null);
    },
  });

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      {/* Modern Header Section */}
      <div className="flex flex-col gap-4 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-bold text-slate-800">
            My Documents
            <span className="text-sm font-normal text-slate-500 ml-2">
              ({files?.length || 0} files)
            </span>
          </h1>
          <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
        </div>

        <div className="h-0.5 bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent" />
      </div>

      {/* File Display Section */}
      {files && files.length !== 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <div
                key={file.id}
                className="group relative bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <Link
                  href={`/dashboard/${file.id}`}
                  className="block p-6 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-slate-800 truncate">
                        {file.name}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(file.createdAt), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Card Footer */}
                <div className="p-4 bg-slate-50 border-t border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span>0 messages</span>
                    </div>
                    <Button
                      onClick={() => deleteFile({ id: file.id })}
                      size="sm"
                      variant="ghost"
                      className="hover:bg-red-50 hover:text-red-600 hover:rounded-full transition-colors"
                    >
                      {currentDeletingFile === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4 cursor-pointer" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
              </div>
            ))}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <div className="p-4 bg-blue-50/50 rounded-full">
            <Ghost className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="font-semibold text-xl text-slate-800">
            Pretty empty around here
          </h3>
          <p className="text-slate-600">
            Let&apos;s upload your first document
          </p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;

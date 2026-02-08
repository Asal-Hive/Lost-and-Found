import { useState } from "react";
import { Comment as CommentType } from "../../../services/commentsApi";
import { useAuth } from "../../auth/AuthProvider";
import { Badge } from "../ui/badge";
import { MoreVertical, Reply, Flag, Trash2, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface CommentItemProps {
  comment: CommentType;
  onReply: (commentId: number) => void;
  onEdit?: (commentId: number, content: string) => void;
  onDelete?: (commentId: number) => void;
  onReport?: (commentId: number) => void;
  isReply?: boolean;
}

export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReport,
  isReply = false,
}: CommentItemProps) {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isAuthor = user && user.email === comment.author_email;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'همین حالا';
      if (diffMins < 60) return `${diffMins} دقیقه پیش`;
      if (diffHours < 24) return `${diffHours} ساعت پیش`;
      if (diffDays < 7) return `${diffDays} روز پیش`;
      
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <div className={`${isReply ? 'mr-6' : ''} border-b border-gray-200 pb-4 last:border-b-0 last:pb-0`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {/* Author and Date */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm text-gray-900">
                {comment.author_name || comment.author_email}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <Badge variant="secondary" className="text-xs">
                  ویرایش شده
                </Badge>
              )}
            </div>

            {/* Content */}
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-2">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-2">
              {!isReply && user && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <Reply className="w-3 h-3" />
                  پاسخ
                </button>
              )}
              
              {user && !isAuthor && onReport && (
                <button
                  onClick={() => onReport(comment.id)}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                >
                  <Flag className="w-3 h-3" />
                  گزارش
                </button>
              )}

              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" dir="rtl">
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={() => onEdit(comment.id, comment.content)}
                      >
                        <Edit2 className="w-4 h-4 ml-2" />
                        ویرایش
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReport={onReport}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کامنت</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید می‌خواهید این کامنت را حذف کنید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onDelete) {
                  onDelete(comment.id);
                }
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


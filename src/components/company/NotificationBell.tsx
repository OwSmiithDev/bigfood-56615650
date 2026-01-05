import { useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationBell = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to="/empresa/notificacoes"
      className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Bell className="w-5 h-5 text-muted-foreground" />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5"
          >
            <Badge
              variant="destructive"
              className="h-5 min-w-[20px] px-1.5 text-xs font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-50"
        >
          Notificações
        </motion.div>
      )}
    </Link>
  );
};

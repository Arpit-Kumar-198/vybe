import { useEffect, useState } from "react";
import axios from "axios";

const useSearchUsers = (query) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);

        const res = await axios.get(
          `http://localhost:8000/api/v1/user/search?query=${encodeURIComponent(query)}`,
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (error) {
        console.error("Search users error:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(searchUsers, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return { users, loading };
};

export default useSearchUsers;
import { useEffect, useState } from "react";
import API from "../services/api";

function Sidebar({ onSelectChat }) {

  const [users, setUsers] = useState([]);

  useEffect(() => {

    const fetchUsers = async () => {
      const res = await API.get("/users");
      setUsers(res.data.users);
    };

    fetchUsers();

  }, []);

  const startChat = async (user) => {

    const res = await API.post("/chat", {
      userId: user._id,
    });

    onSelectChat(res.data.chat);
  };

  return (
    <div style={{ width: "30%", borderRight: "1px solid gray" }}>

      <h3>Users</h3>

      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => startChat(user)}
          style={{
            padding: "10px",
            cursor: "pointer",
            borderBottom: "1px solid #ddd",
          }}
        >
          {user.name}
        </div>
      ))}

    </div>
  );
}

export default Sidebar;
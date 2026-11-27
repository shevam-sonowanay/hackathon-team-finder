import { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [hackathon, setHackathon] = useState("");
  const [roleNeeded, setRoleNeeded] = useState("");
  const [skills, setSkills] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    const q = query(collection(db, "team_posts"), orderBy("createdAt", "desc"));
    const unsubPosts = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsubAuth();
      unsubPosts();
    };
  }, []);

  const handleLogin = () => signInWithPopup(auth, provider);
  const handleLogout = () => signOut(auth);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!hackathon.trim() || !roleNeeded.trim() || !user) return;
    await addDoc(collection(db, "team_posts"), {
      hackathon,
      roleNeeded,
      skills,
      desc,
      authorName: user.displayName,
      authorEmail: user.email,
      requests: [],
      createdAt: Date.now(),
    });
    setHackathon("");
    setRoleNeeded("");
    setSkills("");
    setDesc("");
  };

  const handleRequestJoin = async (postId) => {
    if (!user) return alert("Please sign in with Google first!");
    const postRef = doc(db, "team_posts", postId);
    await updateDoc(postRef, {
      requests: arrayUnion(`${user.displayName} (${user.email})`),
    });
    alert("Join request sent! The team lead can now see your email.");
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.hackathon.toLowerCase().includes(search.toLowerCase()) ||
      p.skills.toLowerCase().includes(search.toLowerCase()) ||
      p.roleNeeded.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", backgroundColor: "#0f172a", color: "#f8fafc", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #334155", paddingBottom: "16px", marginBottom: "24px" }}>
          <div>
            <h1 style={{ margin: 0, color: "#38bdf8" }}>Hackathon Team Finder</h1>
            <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>Find teammates for SIH, GSoC & College Hackathons | Built by Shevam Sonowanay</p>
          </div>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", color: "#cbd5e1" }}>Hi, {user.displayName}</span>
              <button onClick={handleLogout} style={btnStyle("#ef4444")}>Logout</button>
            </div>
          ) : (
            <button onClick={handleLogin} style={btnStyle("#22c55e")}>Sign in with Google</button>
          )}
        </div>

        {user && (
          <form onSubmit={handleCreatePost} style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155", marginBottom: "24px" }}>
            <h3 style={{ marginTop: 0, color: "#38bdf8" }}>Post a Team Opening</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <input required placeholder="Hackathon Name (e.g. SIH 2026)" value={hackathon} onChange={(e) => setHackathon(e.target.value)} style={inputStyle} />
              <input required placeholder="Role Needed (e.g. Frontend / AI Dev)" value={roleNeeded} onChange={(e) => setRoleNeeded(e.target.value)} style={inputStyle} />
              <input required placeholder="Skills (e.g. React, C++, Python)" value={skills} onChange={(e) => setSkills(e.target.value)} style={inputStyle} />
            </div>
            <textarea rows={2} placeholder="Short project idea or details..." value={desc} onChange={(e) => setDesc(e.target.value)} style={{ ...inputStyle, width: "100%", marginTop: "12px", boxSizing: "border-box" }} />
            <button type="submit" style={{ ...btnStyle("#0284c7"), marginTop: "12px" }}>Publish Team Post</button>
          </form>
        )}

        <input
          placeholder="Search by hackathon, role, or skill (e.g. React, C++, SIH)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, width: "100%", boxSizing: "border-box", marginBottom: "20px" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {filteredPosts.map((post) => (
            <div key={post.id} style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{ backgroundColor: "#0284c7", fontSize: "12px", padding: "4px 10px", borderRadius: "99px", fontWeight: "bold" }}>{post.hackathon}</span>
                <h3 style={{ margin: "12px 0 6px 0", color: "#f8fafc" }}>Looking for: {post.roleNeeded}</h3>
                <p style={{ margin: "4px 0", fontSize: "13px", color: "#38bdf8" }}><strong>Skills:</strong> {post.skills}</p>
                <p style={{ margin: "8px 0", fontSize: "14px", color: "#cbd5e1" }}>{post.desc}</p>
              </div>
              <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #334155" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#94a3b8" }}>Posted by: {post.authorName}</p>
                {user?.email === post.authorEmail ? (
                  <div style={{ fontSize: "12px", color: "#22c55e" }}>
                    <strong>Join Requests ({post.requests?.length || 0}):</strong> {post.requests?.join(", ") || "None yet"}
                  </div>
                ) : (
                  <button onClick={() => handleRequestJoin(post.id)} style={btnStyle("#22c55e")}>Request to Join</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  backgroundColor: "#0f172a",
  color: "#f8fafc",
  border: "1px solid #475569",
  borderRadius: "8px",
  padding: "10px 12px",
  fontSize: "14px",
};

const btnStyle = (bg) => ({
  backgroundColor: bg,
  color: bg === "#22c55e" ? "#0f172a" : "#fff",
  border: "none",
  padding: "9px 16px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
});

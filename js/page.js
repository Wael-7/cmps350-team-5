"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "./statistics.module.css";

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ icon, value, label, sub, accent }) {
  return (
    <div className={`${styles.card} ${accent ? styles.cardAccent : ""}`}>
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardValue}>{value ?? "—"}</div>
      <div className={styles.cardLabel}>{label}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  );
}

// ── Rank badge ────────────────────────────────────────────────
function RankBadge({ index }) {
  const cls =
    index === 0 ? styles.rankGold :
    index === 1 ? styles.rankSilver :
    index === 2 ? styles.rankBronze : "";
  return <div className={`${styles.rank} ${cls}`}>{index + 1}</div>;
}

// ── Avatar ────────────────────────────────────────────────────
function Avatar({ user }) {
  return (
    <div className={styles.avatar}>
      {user.profilePicture
        ? <img src={user.profilePicture} alt={user.username} />
        : (user.username?.[0] ?? "?").toUpperCase()
      }
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────
function Leaderboard({ icon, title, rows, valueKey, suffix = "" }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span>{icon}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.sectionLine} />
      </div>
      <div className={styles.listCard}>
        {rows.length === 0 && <div className={styles.empty}>No data yet.</div>}
        {rows.map((row, i) => (
          <div key={row.id ?? i} className={styles.listRow}>
            <RankBadge index={i} />
            <Avatar user={row} />
            <div className={styles.listInfo}>
              <div className={styles.listName}>@{row.username}</div>
              {row.email && <div className={styles.listSub}>{row.email}</div>}
            </div>
            <div className={`${styles.badge} ${i < 3 ? styles.badgeAccent : ""}`}>
              {row[valueKey]}{suffix}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Most Liked Posts list ─────────────────────────────────────
function TopLikedPosts({ posts }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span>❤️</span>
        <h2 className={styles.sectionTitle}>Most Liked Posts</h2>
        <div className={styles.sectionLine} />
      </div>
      <div className={styles.listCard}>
        {posts.length === 0 && <div className={styles.empty}>No posts yet.</div>}
        {posts.map((post, i) => (
          <div key={post.id ?? i} className={styles.listRow}>
            <RankBadge index={i} />
            <div className={styles.listInfo}>
              <div className={styles.listName} style={{ fontWeight: 400, fontSize: 13 }}>
                {post.content?.length > 90
                  ? post.content.slice(0, 90) + "…"
                  : post.content}
              </div>
              <div className={styles.listSub}>
                by @{post.author?.username ?? "unknown"} ·{" "}
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : ""}
              </div>
            </div>
            <div className={`${styles.badge} ${i < 3 ? styles.badgeAccent : ""}`}>
              ❤️ {post.likeCount ?? 0}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Posts Per Day bar chart ───────────────────────────────────
function PostsPerDayChart({ rows }) {
  const max = Math.max(...rows.map(r => r.value), 1);
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span>📅</span>
        <h2 className={styles.sectionTitle}>Posts Per Day — Last 7 Days</h2>
        <div className={styles.sectionLine} />
      </div>
      <div className={styles.barChart}>
        {rows.length === 0 && <div className={styles.empty}>No data yet.</div>}
        {rows.map((row, i) => (
          <div key={i} className={styles.barRow}>
            <div className={styles.barLabel}>{row.label}</div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${Math.round((row.value / max) * 100)}%` }}
              />
            </div>
            <div className={styles.barCount}>{row.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/statistics");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const ov           = stats?.overview      ?? {};
  const mostFollowed = stats?.mostFollowed  ?? [];
  const topPosters   = stats?.topPosters    ?? [];
  const mostActive   = stats?.mostActive    ?? [];
  const topLiked     = stats?.topLikedPosts ?? [];
  const postsPerDay  = stats?.postsPerDay   ?? [];

  return (
    <div className={styles.page}>

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navBrand}>
          <div className={styles.navLogo}>H</div>
          <span className={styles.navName}>Hive</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="/feed.html" className={styles.navLink}>Feed</a>
          <Link href="/statistics" className={`${styles.navLink} ${styles.navLinkActive}`}>
            Statistics
          </Link>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderTop}>
            <div className={styles.pageHeaderIcon}>📊</div>
            <h1 className={styles.pageHeaderTitle}>Platform Statistics</h1>
          </div>
          <p className={styles.pageHeaderSub}>
            Live insights across users, posts, engagement, and content.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.center}>
            <div className={styles.spinner} />
            <span>Loading statistics…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className={styles.errorBox}>
            <span>⚠️ {error}</span>
            <button className={styles.retryBtn} onClick={fetchStats}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Overview Cards ──────────────────────────────── */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span>🔢</span>
                <h2 className={styles.sectionTitle}>Overview</h2>
                <div className={styles.sectionLine} />
              </div>
              <div className={styles.cardsGrid}>
                <StatCard icon="👥" accent value={ov.totalUsers}    label="Total Users"    sub="Registered accounts" />
                <StatCard icon="📝"       value={ov.totalPosts}    label="Total Posts"    sub="Published content" />
                <StatCard icon="❤️"       value={ov.totalLikes}    label="Total Likes"    sub="Reactions given" />
                <StatCard icon="💬"       value={ov.totalComments} label="Total Comments" sub="Conversations" />
                <StatCard icon="🔗"       value={ov.totalFollows}  label="Total Follows"  sub="Connections made" />
                <StatCard icon="📈" value={ov.avgFollowersPerUser != null ? Number(ov.avgFollowersPerUser).toFixed(1) : "—"} label="Avg Followers" sub="Per user" />
                <StatCard icon="✍️" value={ov.avgPostsPerUser    != null ? Number(ov.avgPostsPerUser).toFixed(1)    : "—"} label="Avg Posts"     sub="Per user" />
                <StatCard icon="💡" value={ov.avgLikesPerPost    != null ? Number(ov.avgLikesPerPost).toFixed(1)    : "—"} label="Avg Likes"     sub="Per post" />
              </div>
            </section>

            {/* ── Most Followed ───────────────────────────────── */}
            <Leaderboard
              icon="🏆" title="Most Followed Users"
              rows={mostFollowed} valueKey="followerCount" suffix=" followers"
            />

            {/* ── Top Posters + Most Active ────────────────────── */}
            <div className={styles.twoCol}>
              <Leaderboard
                icon="✍️" title="Top Posters"
                rows={topPosters} valueKey="postCount" suffix=" posts"
              />
              <Leaderboard
                icon="⚡" title="Most Active Users"
                rows={mostActive} valueKey="activityScore" suffix=" actions"
              />
            </div>

            {/* ── Most Liked Posts ─────────────────────────────── */}
            <TopLikedPosts posts={topLiked} />

            {/* ── Posts Per Day bar chart ──────────────────────── */}
            <PostsPerDayChart rows={postsPerDay} />
          </>
        )}

      </main>
    </div>
  );
}

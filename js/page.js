"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "./statistics.module.css";

// ── StatCard component ────────────────────────────────────────
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

  const ov = stats?.overview ?? {};

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

      {/* ── Main Content ─────────────────────────────────────── */}
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

        {/* ── Overview Cards ────────────────────────────────── */}
        {!loading && !error && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>🔢</span>
              <h2 className={styles.sectionTitle}>Overview</h2>
              <div className={styles.sectionLine} />
            </div>

            <div className={styles.cardsGrid}>
              <StatCard
                icon="👥" accent
                value={ov.totalUsers}
                label="Total Users"
                sub="Registered accounts"
              />
              <StatCard
                icon="📝"
                value={ov.totalPosts}
                label="Total Posts"
                sub="Published content"
              />
              <StatCard
                icon="❤️"
                value={ov.totalLikes}
                label="Total Likes"
                sub="Reactions given"
              />
              <StatCard
                icon="💬"
                value={ov.totalComments}
                label="Total Comments"
                sub="Conversations"
              />
              <StatCard
                icon="🔗"
                value={ov.totalFollows}
                label="Total Follows"
                sub="Connections made"
              />
              <StatCard
                icon="📈"
                value={ov.avgFollowersPerUser != null ? Number(ov.avgFollowersPerUser).toFixed(1) : "—"}
                label="Avg Followers"
                sub="Per user"
              />
              <StatCard
                icon="✍️"
                value={ov.avgPostsPerUser != null ? Number(ov.avgPostsPerUser).toFixed(1) : "—"}
                label="Avg Posts"
                sub="Per user"
              />
              <StatCard
                icon="💡"
                value={ov.avgLikesPerPost != null ? Number(ov.avgLikesPerPost).toFixed(1) : "—"}
                label="Avg Likes"
                sub="Per post"
              />
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
